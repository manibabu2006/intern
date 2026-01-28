import db from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { item_id, customer_id } = req.body;

    if (!item_id || !customer_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await db.query(
      `INSERT INTO requests (item_id, customer_id, status)
       VALUES (?, ?, 'Pending')`,
      [item_id, customer_id]
    );

    res.status(201).json({ success: true, message: 'Booking request created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
