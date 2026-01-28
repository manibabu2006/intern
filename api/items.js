import mysql from "mysql2/promise";

// Use a pool (safe for multiple requests)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,  // make sure this matches your env
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default async function handler(req, res) {
  try {
    // ===== POST: Add Item =====
    if (req.method === "POST") {
      const { action } = req.body;

      if (action === "addItem") {
        const { shop_name, item_name, category, price_per_day, owner_id, location } = req.body;

        // Validate
        if (!shop_name || !item_name || !category || !price_per_day || !owner_id || !location) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Insert into DB
        const sql = `
          INSERT INTO items
          (shop_name, item_name, category, price_per_day, owner_id, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.execute(sql, [shop_name, item_name, category, Number(price_per_day), Number(owner_id), location]);

        return res.json({ success: true, message: "Item added successfully" });
      }

      // ===== POST: Get Items by category & location =====
      if (action === "getItems") {
        const { category, location } = req.body;
        if (!category || !location) {
          return res.status(400).json({ success: false, message: "Missing category or location" });
        }

        const [rows] = await db.execute(
          `SELECT item_id, shop_name, item_name, category, price_per_day, owner_id, location
           FROM items
           WHERE category = ? AND location = ?`,
          [category, location]
        );

        return res.json({ success: true, items: rows });
      }
    }

    // ===== GET: All locations =====
    if (req.method === "GET") {
      const [rows] = await db.execute("SELECT DISTINCT location FROM items");
      return res.json({ success: true, locations: rows.map(r => r.location) });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (err) {
    console.error("ITEM API ERROR:", err);
    return res.status(500).json({ success: false, message: "Server/database error" });
  }
}
