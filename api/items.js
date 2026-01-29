// items.js
import db from "./_db.js";

export default async function handler(req, res) {
  try {

    /* ===== GET LOCATIONS ===== */
    if (req.method === "GET") {
      const [rows] = await db.execute(
        `SELECT DISTINCT location FROM items 
         WHERE is_active=1 AND location IS NOT NULL AND TRIM(location)<>''`
      );
      return res.json({ success: true, locations: rows.map(r => r.location) });
    }

    /* ===== ADD ITEM ===== */
    if (req.method === "POST" && !req.body.action) {
      const { owner_id, shop_name, item_name, category, price_per_day, location, image_url } = req.body;

      if (!owner_id || !shop_name || !item_name || !category || !price_per_day || !location) {
        return res.status(400).json({ success: false, message: "All fields required" });
      }

      await db.execute(
        `INSERT INTO items 
        (owner_id, shop_name, item_name, category, price_per_day, location, image_url)
        VALUES (?,?,?,?,?,?,?)`,
        [owner_id, shop_name.trim(), item_name.trim(), category, price_per_day, location.trim(), image_url || null]
      );

      return res.json({ success: true });
    }

    /* ===== GET OWNER ITEMS ===== */
    if (req.method === "POST" && req.body.action === "getOwnerItems") {
      const { owner_id } = req.body;

      const [items] = await db.execute(
        `SELECT i.*, 
        (SELECT COUNT(*) FROM bookings b WHERE b.item_id=i.item_id) AS total_bookings
        FROM items i WHERE owner_id=? ORDER BY item_id DESC`,
        [owner_id]
      );

      return res.json({ success: true, items });
    }

    /* ===== CUSTOMER ITEMS ===== */
    if (req.method === "POST" && req.body.action === "getItems") {
      const { category, location } = req.body;

      const [items] = await db.execute(
        `SELECT item_id, item_name, shop_name, price_per_day, image_url
         FROM items 
         WHERE is_active=1 AND category=? AND location=?`,
        [category, location.trim()]
      );

      return res.json({ success: true, items });
    }

    /* ===== UPDATE ITEM ===== */
    if (req.method === "PUT") {
      const { item_id, owner_id, item_name, price_per_day, category, location, is_active } = req.body;

      const [r] = await db.execute(
        `UPDATE items SET item_name=?, price_per_day=?, category=?, location=?, is_active=?
         WHERE item_id=? AND owner_id=?`,
        [item_name, price_per_day, category, location, is_active, item_id, owner_id]
      );

      if (!r.affectedRows) return res.status(403).json({ success: false });
      return res.json({ success: true });
    }

    /* ===== DELETE ITEM ===== */
    if (req.method === "DELETE") {
      const { item_id, owner_id } = req.body;

      const [r] = await db.execute(
        `DELETE FROM items WHERE item_id=? AND owner_id=?`,
        [item_id, owner_id]
      );

      if (!r.affectedRows) return res.status(403).json({ success: false });
      return res.json({ success: true });
    }

    res.status(405).json({ success: false });

  } catch (err) {
    console.error("ITEM ERROR:", err);
    res.status(500).json({ success: false });
  }
}
