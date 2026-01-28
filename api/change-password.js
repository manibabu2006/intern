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

/* ---------- CHANGE PASSWORD HANDLER ---------- */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { username, currentPassword, newPassword } = req.body;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).send("All fields are required");
  }

  try {
    /* 1. Get user password */
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = rows[0];

    /* 2. Verify current password */
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).send("Current password is incorrect");
    }

    /* 3. Hash new password */
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    /* 4. Update password */
    await pool.query(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashedPassword, username]
    );

    return res.status(200).send("Password changed successfully");

  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).send("Database error");
  }
}
