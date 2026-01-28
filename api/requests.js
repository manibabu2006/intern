import db from './db.js';

export default async function handler(req, res) {

  /* ---------- CREATE REQUEST (CUSTOMER) ---------- */
  if (req.method === 'POST') {
    const { item_id, customer_id } = req.body;

    await db.query(
      `INSERT INTO requests (item_id, customer_id, status)
       VALUES (?, ?, 'Pending')`,
      [item_id, customer_id]
    );

    return res.json({ success: true });
  }

  /* ---------- GET REQUESTS (OWNER) ---------- */
  if (req.method === 'GET') {
    const owner_id = req.query.owner_id;

    const [rows] = await db.query(
      `
      SELECT 
        r.id AS request_id,
        r.status,
        i.name AS item_name,
        u.name AS customer_name,
        u.phone,
        u.aadhar
      FROM requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u ON r.customer_id = u.id
      WHERE i.owner_id = ?
      `,
      [owner_id]
    );

    return res.json(rows);
  }

  /* ---------- ACCEPT / REJECT ---------- */
  if (req.method === 'PUT') {
    const { request_id, status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await db.query(
      'UPDATE requests SET status = ? WHERE id = ?',
      [status, request_id]
    );

    return res.json({ success: true });
  }

  res.status(405).end();
}
