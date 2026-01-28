import db from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const owner_id = req.query.owner_id;

    if (!owner_id) {
      return res.status(400).json({ message: 'Owner ID required' });
    }

    const [rows] = await db.query(
      `
      SELECT 
        r.id AS request_id,
        r.status,
        i.item_name,
        i.category,
        i.price,
        u.name AS customer_name,
        u.phone,
        u.aadhar
      FROM requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u ON r.customer_id = u.id
      WHERE i.owner_id = ?
      ORDER BY r.id DESC
      `,
      [owner_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
