// reset-password.js
import db from "./_db.js";
import bcrypt from "bcryptjs";
import { verifyOTP, deleteOTP } from "./_otpstore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { username, otp, newPassword, role } = req.body;

  if (!username || !otp || !newPassword || !role) return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const validOTP = await verifyOTP(username, otp, role);
    if (!validOTP) return res.status(401).json({ success: false, message: "Invalid or expired OTP" });

    const table = role === "owner" ? "owners" : "customers";

    const hashed = bcrypt.hashSync(newPassword, 10);

    await db.query(`UPDATE ${table} SET password = ? WHERE username = ?`, [hashed, username]);

    await deleteOTP(username, role);

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Reset failed" });
  }
}
