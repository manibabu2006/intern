import mysql from "mysql2/promise";

/* ================= DB POOL ================= */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ================= API HANDLER ================= */
export default async function handler(req, res) {
  try {

    /* =====================================================
       POST REQUESTS (ACTION BASED)
    ===================================================== */
    if (req.method === "POST") {
      const { action } = req.body || {};

      /* ---------- 1️⃣ CREATE BOOKING ---------- */
      if (action === "createBooking") {
        const { item_id, customer_id, rental_duration } = req.body;

        if (!item_id || !customer_id || !rental_duration) {
          return res.status(400).json({
            success: false,
            message: "Missing booking fields",
          });
        }

        await db.execute(
          `INSERT INTO bookings (item_id, customer_id, rental_duration, status)
           VALUES (?, ?, ?, 'Pending')`,
          [Number(item_id), Number(customer_id), Number(rental_duration)]
        );

        return res.json({ success: true });
      }

      /* ---------- 2️⃣ GET ITEMS BY CATEGORY + LOCATION ---------- */
      if (action === "getItems") {
        const { category, location } = req.body;

        if (!category || !location) {
          return res.status(400).json({
            success: false,
            message: "Category and location required",
          });
        }

        const [rows] = await db.execute(
          `SELECT item_id, item_name, shop_name, price_per_day
           FROM items
           WHERE category=? AND location=?`,
          [category, location]
        );

        return res.json({ success: true, items: rows });
      }

      /* ---------- 3️⃣ GET ALL ITEMS (FOR LOCATIONS) ---------- */
      if (action === "getAllItems") {
        const [rows] = await db.execute(
          `SELECT location FROM items WHERE location IS NOT NULL`
        );

        return res.json({ success: true, items: rows });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    /* =====================================================
       GET REQUESTS (HISTORY)
    ===================================================== */
    if (req.method === "GET") {

      /* ---------- CUSTOMER HISTORY ---------- */
      if (req.query.customer_id) {
        const [rows] = await db.execute(
          `
          SELECT 
            b.booking_id,
            b.rental_duration,
            b.status,
            i.item_name,
            i.shop_name
          FROM bookings b
          JOIN items i ON b.item_id = i.item_id
          WHERE b.customer_id=?
          ORDER BY b.booking_id DESC
          `,
          [Number(req.query.customer_id)]
        );

        return res.json({ success: true, history: rows });
      }

      /* ---------- OWNER HISTORY ---------- */
      if (req.query.owner_id) {
        const [rows] = await db.execute(
          `
          SELECT 
            b.booking_id,
            b.status,
            b.rental_duration,
            i.item_name,
            c.name AS customer_name,
            c.phone
          FROM bookings b
          JOIN items i ON b.item_id = i.item_id
          JOIN customers c ON b.customer_id = c.customer_id
          WHERE i.owner_id=?
          ORDER BY b.booking_id DESC
          `,
          [Number(req.query.owner_id)]
        );

        return res.json({ success: true, requests: rows });
      }

      return res.status(400).json({
        success: false,
        message: "Missing query parameter",
      });
    }

    /* =====================================================
       PUT REQUEST (ACCEPT / REJECT)
    ===================================================== */
    if (req.method === "PUT") {
      const { booking_id, status } = req.body;

      if (!booking_id || !["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid data",
        });
      }

      await db.execute(
        `UPDATE bookings SET status=? WHERE booking_id=?`,
        [status, Number(booking_id)]
      );

      return res.json({ success: true });
    }

    return res.status(405).json({ success: false });

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
