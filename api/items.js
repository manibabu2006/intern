import db from "./_db.js";

export default async function handler(req, res) {
  try {

    /* ================= GET OWNER ITEMS ================= */
    if (req.method === "GET" && req.query.owner_id) {
      const owner_id = Number(req.query.owner_id);

      const [items] = await db.execute(
        `SELECT item_id, shop_name, item_name, category, price_per_day, location, is_active, image_url
         FROM items
         WHERE owner_id = ?
         ORDER BY item_id DESC`,
        [owner_id]
      );

      return res.json({ success: true, items });
    }

    /* ================= ADD ITEM ================= */
    if (req.method === "POST" && !req.body.action) {
      const {
        owner_id,
        shop_name,
        item_name,
        category,
        price_per_day,
        location,
        image_url,
        is_active
      } = req.body;

      if (!owner_id || !shop_name || !item_name || !category || !price_per_day || !location) {
        return res.status(400).json({ success: false, message: "All fields required" });
      }

      await db.execute(
        `INSERT INTO items
         (owner_id, shop_name, item_name, category, price_per_day, location, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          owner_id,
          shop_name.trim(),
          item_name.trim(),
          category,
          price_per_day,
          location.trim(),
          image_url || null,
          is_active ? 1 : 0
        ]
      );

      return res.json({ success: true });
    }

    /* ================= UPDATE ITEM ================= */
    if (req.method === "PUT") {
      const { item_id, owner_id, item_name, price_per_day, is_active, image_url } = req.body;

      if (!item_id || !owner_id) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }

      await db.execute(
        `UPDATE items
         SET item_name=?, price_per_day=?, is_active=?, image_url=?
         WHERE item_id=? AND owner_id=?`,
        [
          item_name,
          price_per_day,
          is_active ? 1 : 0,
          image_url || null,
          item_id,
          owner_id
        ]
      );

      return res.json({ success: true });
    }

    res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
