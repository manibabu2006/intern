const pool = require("./_db");

/**
 * Save OTP (old OTPs for same user are removed)
 */
async function saveOTP(username, otp, expiresAt) {
  await pool.query("DELETE FROM otp_codes WHERE username = ?", [username]);
  await pool.query(
    "INSERT INTO otp_codes (username, otp, expires_at) VALUES (?, ?, ?)",
    [username, otp, expiresAt]
  );
}

/**
 * Verify OTP (without deleting)
 */
async function verifyOTP(username, otp) {
  const [rows] = await pool.query(
    "SELECT * FROM otp_codes WHERE username = ? AND otp = ? AND expires_at > NOW()",
    [username, otp]
  );
  return rows.length > 0;
}

/**
 * Delete OTP (used after successful verification)
 */
async function deleteOTP(username) {
  await pool.query("DELETE FROM otp_codes WHERE username = ?", [username]);
}

module.exports = {
  saveOTP,
  verifyOTP,
  deleteOTP
};
