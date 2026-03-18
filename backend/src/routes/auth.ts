import { Router } from "express";
import { pool } from "../service/db";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", async (req, res) => {
    const { userId, pin } = req.body;

    if (!userId || !pin) {
        return res.status(400).json({ error: "กรุณากรอกรหัสพนักงานและรหัสผ่าน" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT id, name, password, role, login_attempts, lock_until FROM users WHERE id = $1",
            [(userId || '').toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง" });
        }

        const user = rows[0];

        // Check if account is locked
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            const timeLeft = Math.ceil((new Date(user.lock_until).getTime() - Date.now()) / 60000);
            return res.status(403).json({ 
                error: `บัญชีถูกระงับชั่วคราวเนื่องจากลองผิดเกิน 5 ครั้ง กรุณาลองใหม่ในอีก ${timeLeft} นาที` 
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(pin, user.password);

        if (!isMatch) {
            const newAttempts = (user.login_attempts || 0) + 1;
            let lockUntil = null;
            let errorMsg = "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง";

            if (newAttempts >= 5) {
                // Lock for 10 minutes
                lockUntil = new Date(Date.now() + 10 * 60 * 1000);
                errorMsg = "ลองผิดเกิน 5 ครั้ง บัญชีถูกระงับ 10 นาที";
            }

            await pool.query(
                "UPDATE users SET login_attempts = $1, lock_until = $2 WHERE id = $3",
                [newAttempts, lockUntil, user.id]
            );

            return res.status(401).json({ error: errorMsg });
        }

        // Success: Reset attempts and lock
        await pool.query(
            "UPDATE users SET login_attempts = 0, lock_until = NULL WHERE id = $1",
            [user.id]
        );

        const token = Buffer.from(JSON.stringify({ id: user.id, ts: Date.now() })).toString('base64');

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });

    } catch (err: any) {
        console.error("Login error:", err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

router.post("/register", async (req, res) => {
    const { userId, password, name, role, adminId, adminPassword } = req.body;

    if (!userId || !password || !adminId || !adminPassword) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วนและยืนยันตัวตนโดย Admin" });
    }

    try {
        // 1. Verify Admin
        const { rows: adminRows } = await pool.query(
            "SELECT id, password, role FROM users WHERE id = $1 AND role = 'admin'",
            [adminId.toLowerCase()]
        );

        if (adminRows.length === 0) {
            return res.status(401).json({ error: "ไม่พบสิทธิ์ Admin หรือรหัสพนักงาน Admin ไม่ถูกต้อง" });
        }

        const admin = adminRows[0];
        const isAdminMatch = await bcrypt.compare(adminPassword, admin.password);
        if (!isAdminMatch) {
            return res.status(401).json({ error: "รหัสผ่าน Admin ไม่ถูกต้อง" });
        }

        // 2. Check if user already exists
        const { rows: existingUser } = await pool.query(
            "SELECT id FROM users WHERE id = $1",
            [userId.toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" });
        }

        // 3. Hash password and save
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (id, name, password, role) VALUES ($1, $2, $3, $4)",
            [userId.toLowerCase(), name || userId, hashedPassword, role || 'cashier']
        );

        res.json({ success: true, message: "เพิ่มพนักงานเรียบร้อยแล้ว" });

    } catch (err: any) {
        console.error("Register error:", err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

export default router;
