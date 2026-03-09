import { Router } from "express";
import { pool } from "../service/db";

const router = Router();

router.post("/login", async (req, res) => {
    const { userId, pin } = req.body;

    if (!userId || !pin) {
        return res.status(400).json({ error: "กรุณากรอกรหัสพนักงานและ PIN" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT id, name, role FROM users WHERE id = $1 AND password = $2",
            [(userId || '').toLowerCase(), pin]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "รหัสพนักงานหรือ PIN ไม่ถูกต้อง" });
        }

        const user = rows[0];
        const token = Buffer.from(JSON.stringify({ id: user.id, ts: Date.now() })).toString('base64');

        res.json({
            token,
            user
        });

    } catch (err: any) {
        console.error("Login error:", err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

export default router;
