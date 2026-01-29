// send-otp.js
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
    const table = role === "owner" ? "owners" : "customers";

    const [rows] = await db.query(`SELECT phone FROM ${table} WHERE username = ?`, [username]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const mobile = rows[0].phone;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "No mobile linked with this user" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await saveOTP(username, otp, expiresAt, role);
    console.log("OTP saved, now sending SMS...");
    await sendOTP(mobile, otp); // will throw error if Twilio not set

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send OTP" });
  }
}
