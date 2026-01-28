import mysql from "mysql2/promise";

// Create a pool (reuse for all APIs)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default async function handler(req, res) {
  try {
    // ---------- CREATE BOOKING REQUEST (CUSTOMER) ----------
    if (req.method === "POST") {
      const { item_id, customer_id, rental_duration } = req.body;

      if (!item_id || !customer_id || !rental_duration) {
        return res
          .status(400)
          .json({ success: false, message: "Missing fields" });
      }

      // Insert booking without booking_date
      await db.execute(
        `INSERT INTO bookings (item_id, customer_id, rental_duration, status)
         VALUES (?, ?, ?, 'Pending')`,
        [Number(item_id), Number(customer_id), Number(rental_duration)]
      );

      return res.json({ success: true, message: "Booking request created" });
    }

    // ---------- GET REQUESTS FOR OWNER ----------
    if (req.method === "GET") {
      const owner_id = req.query.owner_id;
      if (!owner_id)
        return res
          .status(400)
          .json({ success: false, message: "Missing owner_id" });

      const [rows] = await db.execute(
        `
        SELECT 
          b.booking_id AS request_id,
          b.status,
          b.rental_duration,
          i.item_name,
          c.name AS customer_name,
          c.phone,
          c.aadhaar
        FROM bookings b
        JOIN items i ON b.item_id = i.item_id
        JOIN customers c ON b.customer_id = c.customer_id
        WHERE i.owner_id = ?
        ORDER BY b.booking_id DESC
        `,
        [Number(owner_id)]
      );

      return res.json({ success: true, requests: rows });
    }

    // ---------- ACCEPT / REJECT ----------
    if (req.method === "PUT") {
      const { request_id, status } = req.body;

      if (!request_id || !["Accepted", "Rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request data" });
      }

      const [result] = await db.execute(
        "UPDATE bookings SET status = ? WHERE booking_id = ?",
        [status, Number(request_id)]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Booking request not found" });
      }

      return res.json({ success: true, message: `Booking ${status.toLowerCase()}` });
    }

    // Method not allowed
    res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error("CREATE-REQUEST API ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Server/database error" });
  }
}
