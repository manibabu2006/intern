const pool = require("./_db");
const { saveOTP } = require("./_otpstore");
const { sendOTP } = require("./_twilio");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { username } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT mobile FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await saveOTP(username, otp, expiresAt);
    await sendOTP(rows[0].mobile, otp);

    res.status(200).send("OTP sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send OTP");
  }
};
