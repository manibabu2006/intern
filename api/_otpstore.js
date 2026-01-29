// _otpstore.js
import db from "./_db.js";

/**
 * Save OTP
 */
export async function saveOTP(username, otp, expiresAt, role) {
  const cleanRole = role.toLowerCase();

  // Delete old OTPs first (important)
  await db.query(
    "DELETE FROM otps WHERE username = ? AND role = ?",
    [username, cleanRole]
  );

  // Insert new OTP
  await db.query(
    `INSERT INTO otps (username, role, otp, expires_at)
     VALUES (?, ?, ?, ?)`,
    [username, cleanRole, otp, expiresAt]
  );

  console.log("✅ OTP SAVED:", { username, cleanRole, otp, expiresAt });
}

/**
 * Verify OTP
 */
export async function verifyOTP(username, otp, role) {
  const cleanRole = role.toLowerCase();

  const [rows] = await db.query(
    `SELECT otp, expires_at FROM otps
     WHERE username = ? AND role = ?`,
    [username, cleanRole]
  );

  if (rows.length === 0) {
    return { valid: false, reason: "OTP_NOT_FOUND" };
  }

  const dbOTP = String(rows[0].otp).trim();
  const userOTP = String(otp).trim();

  if (dbOTP !== userOTP) {
    return { valid: false, reason: "OTP_MISMATCH" };
  }

  if (new Date(rows[0].expires_at) < new Date()) {
    return { valid: false, reason: "OTP_EXPIRED" };
  }

  return { valid: true };
}

/**
 * Delete OTP (after success)
 */
export async function deleteOTP(username, role) {
  const cleanRole = role.toLowerCase();
  await db.query(
    "DELETE FROM otps WHERE username = ? AND role = ?",
    [username, cleanRole]
  );
}
