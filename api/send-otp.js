import db from "./_db.js";
import { saveOTP } from "./_otpstore.js";
import { sendOTP } from "./_twilio.js";
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, role } = req.body;
  if (!username || !role) {
    return res.status(400).json({ success: false, message: "Username and role are required" });
  }

  try {
    const cleanRole = role.toLowerCase();
    const table = cleanRole === "owner" ? "owners" : "customers";

    const [rows] = await db.execute(
      `SELECT phone FROM ${table} WHERE username = ?`,
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const mobile = rows[0].phone;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "No mobile linked with this user" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await saveOTP(username.trim(), otp, expiresAt, cleanRole);
    console.log("OTP saved, now sending SMS...");
    await sendOTP(mobile, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send OTP" });
  }
}
