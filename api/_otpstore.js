import pool from "./_db.js";

/**
 * Save OTP (deletes previous OTPs for same user & role)
 */
export async function saveOTP(username, otp, expiresAt, role) {
  // Delete old OTP for the same user and role
  await pool.query("DELETE FROM otp_codes WHERE username = ? AND role = ?", [username, role]);

  // Insert new OTP
  await pool.query(
    "INSERT INTO otp_codes (username, otp, expires_at, role) VALUES (?, ?, ?, ?)",
    [username, otp, expiresAt, role]
  );
}

/**
 * Verify OTP
 */
export async function verifyOTP(username, otp, role) {
  const [rows] = await pool.query(
    "SELECT * FROM otp_codes WHERE username = ? AND otp = ? AND expires_at > NOW() AND role = ?",
    [username, otp, role]
  );

  if (rows.length === 0) return false;

  // OTP is used → delete it
  await pool.query("DELETE FROM otp_codes WHERE username = ? AND role = ?", [username, role]);

  return true;
}

/**
 * Cleanup expired OTPs (optional)
 */
export async function cleanupExpiredOTP() {
  await pool.query("DELETE FROM otp_codes WHERE expires_at <= NOW()");
}
