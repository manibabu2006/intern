// _otpstore.js
import db from "./_db.js";

/**
 * Save OTP
 */
export async function saveOTP(username, otp, expiresAt, role) {
  await db.query("DELETE FROM otp_codes WHERE username = ? AND role = ?", [username, role]);

  await db.query(
    "INSERT INTO otp_codes (username, otp, expires_at, role) VALUES (?, ?, ?, ?)",
    [username, otp, expiresAt, role]
  );
}

/**
 * Verify OTP
 */
export async function verifyOTP(username, otp, role) {
  const [rows] = await db.query(
    "SELECT * FROM otp_codes WHERE username = ? AND otp = ? AND expires_at > NOW() AND role = ?",
    [username, otp, role]
  );

  if (rows.length === 0) return false;

  // OTP is used → delete it
  await db.query("DELETE FROM otp_codes WHERE username = ? AND role = ?", [username, role]);

  return true;
}

/**
 * Delete OTP (for password reset)
 */
export async function deleteOTP(username, role) {
  await db.query("DELETE FROM otp_codes WHERE username = ? AND role = ?", [username, role]);
}

/**
 * Cleanup expired OTPs
 */
export async function cleanupExpiredOTP() {
  await db.query("DELETE FROM otp_codes WHERE expires_at <= NOW()");
}
