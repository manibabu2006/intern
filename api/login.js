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

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // 1️⃣ Check OWNER
    let [rows] = await pool.query(
      "SELECT owner_id AS id, username, password, name FROM owners WHERE username = ?",
      [username]
    );

    let role = "owner";

    // 2️⃣ If not owner → check CUSTOMER
    if (rows.length === 0) {
      [rows] = await pool.query(
        "SELECT customer_id AS id, username, password, name FROM customers WHERE username = ?",
        [username]
      );
      role = "customer";
    }

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

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
