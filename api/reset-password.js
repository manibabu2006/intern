// reset-password.js
import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { username, role, otp, newPassword } = req.body;

  if (!username || !role || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    // 1️⃣ Verify OTP
    const [rows] = await db.query(
      `SELECT id, expires_at FROM otps
       WHERE username = ? AND role = ? AND otp = ?
       LIMIT 1`,
      [username, role, otp.toString()]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const { id, expires_at } = rows[0];

    if (new Date(expires_at) < new Date()) {
      await db.query("DELETE FROM otps WHERE id = ?", [id]);
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // 2️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const table = role === "owner" ? "owners" : "customers";

    await db.query(
      `UPDATE ${table} SET password = ? WHERE username = ?`,
      [hashedPassword, username]
    );

    // 3️⃣ Delete OTP (single-use)
    await db.query("DELETE FROM otps WHERE id = ?", [id]);

    return res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
