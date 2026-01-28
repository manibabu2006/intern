import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Determine table and ID column based on role
    const table = role === "owner" ? "owners" : "customers";
    const idCol = role === "owner" ? "owner_id" : "customer_id";

    // Fetch user by username
    const [rows] = await pool.query(
      `SELECT ${idCol} AS id, username, password, name FROM ${table} WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username or role" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // Success: return user info
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: user.id,
      name: user.name,
      role
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}
