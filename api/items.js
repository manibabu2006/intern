import db from "./db.js";

export default async function handler(req, res) {
  try {
    /* ================= ADD ITEM ================= */
    if (req.method === "POST") {
      const {
        owner_id,
        shop_name,
        item_name,
        category,
        price_per_day,
        location,
      } = req.body || {};

      if (
        !owner_id ||
        !shop_name ||
        !item_name ||
        !category ||
        !price_per_day ||
        !location
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields required" });
      }

      // ✅ normalize location
      const cleanLocation = location.trim().toLowerCase();

      await db.execute(
        `INSERT INTO items 
        (owner_id, shop_name, item_name, category, price_per_day, location)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Number(owner_id),
          shop_name.trim(),
          item_name.trim(),
          category,
          Number(price_per_day),
          cleanLocation,
        ]
      );

      return res.json({ success: true });
    }

    /* ================= GET LOCATIONS ================= */
    if (req.method === "GET" && req.query.type === "locations") {
      const [rows] = await db.execute(`
        SELECT DISTINCT TRIM(location) AS location
        FROM items
        WHERE location IS NOT NULL
          AND TRIM(location) <> ''
        ORDER BY location
      `);

      return res.json({
        success: true,
        locations: rows.map((r) => r.location),
      });
    }

    /* ================= GET ITEMS BY LOCATION ================= */
    if (req.method === "GET") {
      const { location } = req.query;

      let sql = `SELECT * FROM items`;
      let params = [];

      if (location) {
        sql += ` WHERE location = ?`;
        params.push(location.trim().toLowerCase());
      }

      const [items] = await db.execute(sql, params);
      return res.json({ success: true, items });
    }

    res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
