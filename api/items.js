import db from "./_db.js";

export default async function handler(req, res) {
  try {

    /* ================= GET ALL LOCATIONS ================= */
    if (req.method === "GET" && !req.query.owner_id) {
      const [rows] = await db.execute(
        `SELECT DISTINCT location FROM items ORDER BY location`
      );
      return res.json({
        success: true,
        locations: rows.map(r => r.location)
      });
    }

    /* ================= GET ITEMS BY OWNER ================= */
    if (req.method === "GET" && req.query.owner_id) {
      const owner_id = Number(req.query.owner_id);

      const [items] = await db.execute(
        `SELECT 
           item_id,
           shop_name,
           item_name,
           category,
           price_per_day,
           location,
           is_active,
           image_url
         FROM items
         WHERE owner_id=?
         ORDER BY item_id DESC`,
        [owner_id]
      );

      return res.json({ success: true, items });
    }

    /* ================= GET ITEMS BY CATEGORY & LOCATION ================= */
    if (req.method === "POST" && req.body.action === "getItems") {
      const { category, location } = req.body;

      if (!category || !location) {
        return res.status(400).json({
          success: false,
          message: "Category and location required"
        });
      }

      // IMPORTANT: do NOT filter is_active here
      const [items] = await db.execute(
        `SELECT 
           item_id,
           shop_name,
           item_name,
           category,
           price_per_day,
           location,
           is_active,
           image_url
         FROM items
         WHERE category=? AND location=?
         ORDER BY item_id DESC`,
        [category, location]
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
        return res.status(400).json({
          success: false,
          message: "All fields required"
        });
      }

      await db.execute(
        `INSERT INTO items
         (owner_id, shop_name, item_name, category, price_per_day, location, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(owner_id),
          shop_name.trim(),
          item_name.trim(),
          category.trim(),
          Number(price_per_day),
          location.trim(),
          image_url?.trim() || null,
          Number(is_active) === 1 ? 1 : 0
        ]
      );

      return res.json({ success: true });
    }

    /* ================= UPDATE ITEM ================= */
    if (req.method === "PUT") {
      const {
        item_id,
        owner_id,
        item_name,
        price_per_day,
        is_active,
        image_url
      } = req.body;

      if (!item_id || !owner_id || !item_name || !price_per_day) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      const [result] = await db.execute(
        `UPDATE items
         SET item_name=?, price_per_day=?, is_active=?, image_url=?
         WHERE item_id=? AND owner_id=?`,
        [
          item_name.trim(),
          Number(price_per_day),
          Number(is_active) === 1 ? 1 : 0,
          image_url?.trim() || null,
          Number(item_id),
          Number(owner_id)
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found or owner mismatch"
        });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (err) {
    console.error("ITEM API ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
