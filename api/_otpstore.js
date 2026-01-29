import db from "./_db.js";

export async function saveOTP(username, otp, expiresAt, role) {
  // delete old OTPs for this user
  await db.query(
    "DELETE FROM otps WHERE username = ? AND role = ?",
    [username, role]
  );

  // save new OTP
  await db.query(
    "INSERT INTO otps (username, role, otp, expires_at) VALUES (?, ?, ?, ?)",
    [username, role, otp, expiresAt]
  );
}
