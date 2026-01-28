import pool from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, newPassword } = req.body;

  try {
    const hashed = bcrypt.hashSync(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashed, username]
    );

    await pool.query(
      "DELETE FROM otp_table WHERE username = ?",
      [username]
    );

    res.status(200).send("Password reset successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Reset failed");
  }
}
