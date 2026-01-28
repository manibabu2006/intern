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

  const { name, username, aadhaar, phone, password, role } = req.body;

  if (!name || !username || !aadhaar || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const table = role === "owner" ? "owners" : "customers";
    const idCol = role === "owner" ? "owner_id" : "customer_id";

    // Check if username or aadhaar already exists
    const [existing] = await pool.query(
      `SELECT ${idCol} AS id FROM ${table} WHERE username = ? OR aadhaar = ?`,
      [username, aadhaar]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Username or Aadhaar already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO ${table} (name, username, password, aadhaar, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [name, username, hashedPassword, aadhaar, phone]
    );

    // result.insertId contains the new user id
    const userId = result.insertId;

    return res.status(200).json({ 
      success: true, 
      message: "Registration successful", 
      user_id: userId,   // 👈 send this to frontend
      role,
      name
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}
