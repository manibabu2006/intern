import mysql from "mysql2/promise";

// Create DB pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export default async function handler(req, res) {
  try {
    /* =====================================================
       POST REQUEST
       - Create booking (item_id provided)
       - Get filtered items (category + location)
       - Get all items (for locations dropdown)
    ===================================================== */
    if (req.method === "POST") {
      const { item_id, customer_id, rental_duration, category, location } = req.body || {};

      // 1️⃣ Create a booking request
      if (item_id) {
        if (!customer_id || !rental_duration) {
          return res.status(400).json({ success: false, message: "Missing booking fields" });
        }

        await db.execute(
          `INSERT INTO bookings (item_id, customer_id, rental_duration, status)
           VALUES (?, ?, ?, 'Pending')`,
          [Number(item_id), Number(customer_id), Number(rental_duration)]
        );

        return res.json({ success: true, message: "Booking request created" });
      }

      // 2️⃣ Get filtered items by category & location
      if (category && location) {
        const [rows] = await db.execute(
          `SELECT * FROM items WHERE category=? AND location=?`,
          [category, location]
        );
        return res.json({ success: true, items: rows });
      }

      // 3️⃣ Get all items (for locations dropdown)
      const [allItems] = await db.execute(`SELECT * FROM items`);
      return res.json({ success: true, items: allItems });
    }

    /* =====================================================
       GET REQUEST
       - Customer history (customer_id)
       - Owner history/requests (owner_id)
    ===================================================== */
    if (req.method === "GET") {
      // 1️⃣ Customer booking history
      if (req.query.customer_id) {
        const customer_id = Number(req.query.customer_id);
        const [rows] = await db.execute(
          `SELECT b.booking_id, b.rental_duration, b.status, i.item_name, i.shop_name
           FROM bookings b
           JOIN items i ON b.item_id = i.item_id
           WHERE b.customer_id = ?
           ORDER BY b.booking_id DESC`,
          [customer_id]
        );
        return res.json({ success: true, history: rows });
      }

      // 2️⃣ Owner booking requests / history
      if (req.query.owner_id) {
        const owner_id = Number(req.query.owner_id);
        const [rows] = await db.execute(
          `SELECT b.booking_id, b.status, b.rental_duration,
                  i.item_name, c.name AS customer_name, c.phone, c.aadhaar
           FROM bookings b
           JOIN items i ON b.item_id = i.item_id
           JOIN customers c ON b.customer_id = c.customer_id
           WHERE i.owner_id = ?
           ORDER BY b.booking_id DESC`,
          [owner_id]
        );
        return res.json({ success: true, requests: rows });
      }

      return res.status(400).json({ success: false, message: "Missing query parameters" });
    }

    /* =====================================================
       PUT REQUEST
       - Accept / Reject bookings (owner)
    ===================================================== */
    if (req.method === "PUT") {
      const { request_id, status } = req.body || {};

      if (!request_id || !["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid request data" });
      }

      const [result] = await db.execute(
        `UPDATE bookings SET status=? WHERE booking_id=?`,
        [status, Number(request_id)]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Booking request not found" });
      }

      return res.json({ success: true, message: `Booking ${status}` });
    }

    /* =====================================================
       METHOD NOT ALLOWED
    ===================================================== */
    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (err) {
    console.error("BOOKING API ERROR:", err);
    return res.status(500).json({ success: false, message: "Server/database error" });
  }
}
