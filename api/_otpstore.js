// _otpstore.js
const pool = require("./_db");

/**
 * Save OTP (old OTPs for same user are removed)
 */
async function saveOTP(username, otp, expiresAt) {
  // remove previous OTPs
  await pool.query(
    "DELETE FROM otp_codes WHERE username = ?",
    [username]
  );

  // insert new OTP
  await pool.query(
    "INSERT INTO otp_codes (username, otp, expires_at) VALUES (?, ?, ?)",
    [username, otp, expiresAt]
  );
}

/**
 * Verify OTP
 */
async function verifyOTP(username, otp) {
  const [rows] = await pool.query(
    `SELECT * FROM otp_codes 
     WHERE username = ? AND otp = ? AND expires_at > NOW()`,
    [username, otp]
  );

  if (rows.length === 0) {
    return false;
  }

  // OTP used → delete it
  await pool.query(
    "DELETE FROM otp_codes WHERE username = ?",
    [username]
  );

  return true;
}

/**
 * Cleanup expired OTPs (optional call)
 */
async function cleanupExpiredOTP() {
  await pool.query(
    "DELETE FROM otp_codes WHERE expires_at <= NOW()"
  );
}

module.exports = {
  saveOTP,
  verifyOTP,
  cleanupExpiredOTP
};
