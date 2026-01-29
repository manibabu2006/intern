// send-otp.js
import db from "./_db.js";
import { saveOTP } from "./_otpstore.js";
import { sendOTP } from "./_twilio.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  const { username, role } = req.body;
  if (!username || !role)
    return res.status(400).json({ success: false, message: "Username and role are required" });

  try {
    const cleanRole = role.toLowerCase();
    const table = cleanRole === "owner" ? "owners" : "customers";

    // Get user's phone
    const [rows] = await db.execute("SELECT phone FROM " + table + " WHERE username = ?", [
      username.trim(),
    ]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    const mobile = rows[0].phone;
    if (!mobile) return res.status(400).json({ success: false, message: "No phone linked to user" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save OTP
    await saveOTP(username.trim(), otp, expiresAt, cleanRole);

    // Send OTP
    await sendOTP(mobile, otp);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to send OTP" });
  }
}
