// _otpstore.js
import db from "./_db.js";

export async function saveOTP(username, otp, expiresAt, role) {
  // ensure only ONE OTP per user
  await db.query(
    "DELETE FROM otps WHERE username = ? AND role = ?",
    [username, role]
  );

  await db.query(
    "INSERT INTO otps (username, role, otp, expires_at) VALUES (?, ?, ?, ?)",
    [username, role, otp.toString(), expiresAt]
  );
}
