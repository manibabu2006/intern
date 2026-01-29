// verify-otp.js
import db from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  const { username, role, otp } = req.body;
  if (!username || !role || !otp)
    return res.status(400).json({ success: false, message: "Username, role and OTP are required" });

  try {
    const cleanRole = role.toLowerCase();
    const [rows] = await db.execute(
      `SELECT id, otp, expires_at FROM otps
       WHERE username = ? AND role = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [username.trim(), cleanRole]
    );

    if (rows.length === 0) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    const dbOTP = String(rows[0].otp).trim();
    const userOTP = String(otp).trim();

    if (dbOTP !== userOTP) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (new Date(rows[0].expires_at) < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
