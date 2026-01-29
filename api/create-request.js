import db from "./_db.js";

export default async function handler(req, res) {
  try {
    /* ================= CREATE BOOKING ================= */
    if (req.method === "POST") {
      const { action } = req.body;

      if (action === "createBooking") {
        const { item_id, customer_id, rental_duration } = req.body;
        if (!item_id || !customer_id || !rental_duration) {
          return res.status(400).json({ success: false, message: "Missing booking fields" });
        }

        await db.execute(
          `INSERT INTO bookings (item_id, customer_id, rental_duration, status)
           VALUES (?, ?, ?, 'Pending')`,
          [Number(item_id), Number(customer_id), Number(rental_duration)]
        );

        return res.json({ success: true });
      }

      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    /* ================= GET REQUESTS / HISTORY ================= */
    if (req.method === "GET") {
      if (req.query.customer_id) {
        const [history] = await db.execute(
          `SELECT b.booking_id, b.rental_duration, b.status, i.item_name, i.shop_name
           FROM bookings b
           JOIN items i ON b.item_id = i.item_id
           WHERE b.customer_id=? ORDER BY b.booking_id DESC`,
          [Number(req.query.customer_id)]
        );
        return res.json({ success: true, history });
      }

      if (req.query.owner_id) {
        const [requests] = await db.execute(
          `SELECT b.booking_id, b.status, b.rental_duration, i.item_name, c.name AS customer_name, c.phone
           FROM bookings b
           JOIN items i ON b.item_id = i.item_id
           JOIN customers c ON b.customer_id = c.customer_id
           WHERE i.owner_id=? ORDER BY b.booking_id DESC`,
          [Number(req.query.owner_id)]
        );
        return res.json({ success: true, requests });
      }

      return res.status(400).json({ success: false, message: "Missing query parameter" });
    }

    /* ================= ACCEPT / REJECT ================= */
    if (req.method === "PUT") {
      const { booking_id, status } = req.body;

      if (!booking_id || !["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid data" });
      }

      const [result] = await db.execute(
        `UPDATE bookings SET status=? WHERE booking_id=?`,
        [status, Number(booking_id)]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      return res.json({ success: true });
    }

    res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
