// verify-otp.js
import { verifyOTP } from "./_otpstore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { username, otp, role } = req.body;

  if (!username || !otp || !role) return res.status(400).json({ success: false, message: "All fields are required" });

  try {
    const valid = await verifyOTP(username, otp, role);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid or expired OTP" });

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
}
