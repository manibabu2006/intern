// _otpstore.js
import db from "./_db.js";

// Save OTP in DB
export async function saveOTP(username, otp, expiresAt, role) {
  const cleanRole = role.toLowerCase();

  // Delete previous OTPs for the user
  await db.execute("DELETE FROM otps WHERE username = ? AND role = ?", [
    username,
    cleanRole,
  ]);

  // Insert new OTP
  await db.execute(
    "INSERT INTO otps (username, role, otp, expires_at) VALUES (?, ?, ?, ?)",
    [username, cleanRole, otp, expiresAt]
  );

  console.log("✅ OTP SAVED:", { username, cleanRole, otp, expiresAt });
}

// Delete OTP after successful reset
export async function deleteOTP(username, role) {
  const cleanRole = role.toLowerCase();
  await db.execute("DELETE FROM otps WHERE username = ? AND role = ?", [
    username,
    cleanRole,
  ]);
}
