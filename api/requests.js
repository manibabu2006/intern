import db from './db.js';

export default async function handler(req, res) {
  try {
    /* ---------- CREATE BOOKING REQUEST (CUSTOMER) ---------- */
    if (req.method === 'POST') {
      const { item_id, customer_id, rental_duration } = req.body;

      if (!item_id || !customer_id || !rental_duration) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }

      const booking_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      await db.query(
        `INSERT INTO bookings (item_id, customer_id, rental_duration, booking_date, status)
         VALUES (?, ?, ?, ?, 'Pending')`,
        [item_id, customer_id, rental_duration, booking_date]
      );

      return res.json({ success: true, message: 'Booking request created' });
    }

    /* ---------- GET REQUESTS FOR OWNER ---------- */
    if (req.method === 'GET') {
      const owner_id = req.query.owner_id;
      if (!owner_id) return res.status(400).json({ success: false, message: 'Missing owner_id' });

      const [rows] = await db.query(
        `
        SELECT 
          b.booking_id AS request_id,
          b.status,
          b.rental_duration,
          b.booking_date,
          i.item_name,
          c.name AS customer_name,
          c.phone,
          c.aadhaar
        FROM bookings b
        JOIN items i ON b.item_id = i.item_id
        JOIN customers c ON b.customer_id = c.customer_id
        WHERE i.owner_id = ?
        `,
        [owner_id]
      );

      return res.json({ success: true, requests: rows });
    }

    /* ---------- ACCEPT / REJECT ---------- */
    if (req.method === 'PUT') {
      const { request_id, status } = req.body;

      if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      await db.query(
        'UPDATE bookings SET status = ? WHERE booking_id = ?',
        [status, request_id]
      );

      return res.json({ success: true, message: `Booking ${status.toLowerCase()}` });
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
}
