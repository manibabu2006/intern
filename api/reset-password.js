import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, role, otp, newPassword } = req.body;
  if (!username || !role || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const cleanRole = role.toLowerCase();
    const [rows] = await db.execute(
      `SELECT id, otp, expires_at FROM otps
       WHERE username = ? AND role = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [username.trim(), cleanRole]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const dbOTP = String(rows[0].otp).trim();
    const userOTP = String(otp).trim();

    if (dbOTP !== userOTP) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      await db.execute("DELETE FROM otps WHERE id = ?", [rows[0].id]);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const table = cleanRole === "owner" ? "owners" : "customers";

    await db.execute(
      `UPDATE ${table} SET password = ? WHERE username = ?`,
      [hashedPassword, username.trim()]
    );

    await db.execute("DELETE FROM otps WHERE id = ?", [rows[0].id]);

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
