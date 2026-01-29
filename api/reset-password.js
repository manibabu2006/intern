const pool = require("./_db");
const bcrypt = require("bcryptjs");
const { verifyOTP, deleteOTP } = require("./_otpstore");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, otp, newPassword } = req.body;
  if (!username || !otp || !newPassword) return res.status(400).send("All fields required");

  try {
    const validOTP = await verifyOTP(username, otp);
    if (!validOTP) return res.status(401).send("Invalid or expired OTP");

    const hashed = bcrypt.hashSync(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE username = ?", [hashed, username]);

    await deleteOTP(username); // remove OTP after successful reset
    res.status(200).send("Password reset successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Reset failed");
  }
};
