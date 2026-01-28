import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

/* ---------- DB CONNECTION ---------- */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

/* ---------- REGISTER HANDLER ---------- */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, email, aadhaar, phone, password, role } = req.body;

  if (!name || !email || !aadhaar || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    /* Check if user already exists */
    const table = role === "owner" ? "owners" : "customers";

    const [existing] = await pool.query(
      `SELECT ${role === "owner" ? "owner_id" : "customer_id"} AS id FROM ${table} WHERE email = ? OR aadhaar = ?`,
      [email, aadhaar]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    /* Hash password */
    const hashedPassword = bcrypt.hashSync(password, 10);

    /* Insert user */
    await pool.query(
      `INSERT INTO ${table} (name, email, password, aadhaar, phone) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, aadhaar, phone]
    );

    return res.status(200).json({ success: true, message: "Registration successful" });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}
