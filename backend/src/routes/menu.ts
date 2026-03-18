import { Router, Request, Response } from "express";
import { pool } from "../service/db";

const router = Router();

// ─── GET /categories ─────────────────────────────
router.get("/categories", async (_req: Request, res: Response) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, name, icon, sort_order FROM categories ORDER BY sort_order"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── GET /items?category=xxx ─────────────────────
router.get("/items", async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let query = "SELECT id, name, name_en, price, category_id, description, is_available FROM menu_items";
        const params: string[] = [];

        if (category && typeof category === "string") {
            query += " WHERE category_id = $1";
            params.push(category);
        }

        query += " ORDER BY id";

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching menu items:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── POST /items (Add Menu) ─────────────────────
router.post("/items", async (req: Request, res: Response) => {
    const { name, name_en, price, category_id, description, adminId, adminPassword } = req.body;
    const bcrypt = require('bcrypt');

    if (!name || !price || !category_id || !adminId || !adminPassword) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วนและยืนยันโดย Admin" });
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

        // 2. Insert Menu Item
        const { rows } = await pool.query(
            "INSERT INTO menu_items (name, name_en, price, category_id, description) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [name, name_en || "", price, category_id, description || ""]
        );

        res.json({ success: true, message: "เพิ่มเมนูเรียบร้อยแล้ว", id: rows[0].id });
    } catch (err) {
        console.error("Error adding menu item:", err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มเมนู" });
    }
});

export default router;
