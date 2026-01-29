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
    const [rows] = await db.query(
      `SELECT id, otp, expires_at FROM otps
       WHERE username = ? AND role = ?
       LIMIT 1`,
      [username, role]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const dbOTP = rows[0].otp.toString().trim();
    const userOTP = otp.toString().trim();

    if (dbOTP !== userOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      await db.query("DELETE FROM otps WHERE id = ?", [rows[0].id]);
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const table = role === "owner" ? "owners" : "customers";

    await db.query(
      `UPDATE ${table} SET password = ? WHERE username = ?`,
      [hashedPassword, username]
    );

    await db.query("DELETE FROM otps WHERE id = ?", [rows[0].id]);

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
