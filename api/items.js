import db from "./db.js";

export default async function handler(req, res) {
  try {

    /* ================= GET LOCATIONS ================= */
    if (req.method === "GET") {
      const [rows] = await db.execute(
        `SELECT DISTINCT location FROM items WHERE location IS NOT NULL AND TRIM(location) <> '' ORDER BY location`
      );
      const locations = rows.map(r => r.location);
      return res.json({ success: true, locations });
    }

    /* ================= ADD ITEM ================= */
    if (req.method === "POST" && req.body.action !== "getItems") {
      const { owner_id, shop_name, item_name, category, price_per_day, location } = req.body;

      if (!owner_id || !shop_name || !item_name || !category || !price_per_day || !location) {
        return res.status(400).json({ success: false, message: "All fields required" });
      }

      await db.execute(
        `INSERT INTO items (owner_id, shop_name, item_name, category, price_per_day, location)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Number(owner_id), shop_name.trim(), item_name.trim(), category, Number(price_per_day), location.trim()]
      );

      return res.json({ success: true });
    }

    /* ================= GET ITEMS BY CATEGORY & LOCATION ================= */
    if (req.method === "POST" && req.body.action === "getItems") {
      const { category, location } = req.body;
      if (!category || !location) return res.status(400).json({ success: false, message: "Category & location required" });

      const [items] = await db.execute(
        `SELECT item_id, item_name, shop_name, price_per_day
         FROM items
         WHERE category=? AND location=?`,
        [category, location.trim()]
      );

      return res.json({ success: true, items });
    }

    res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
