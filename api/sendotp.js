const pool = require("./_db");
const otpStore = require("./_otpstore");
const twilioClient = require("./_twilio");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username } = req.body;

  try {
    const [results] = await pool.query(
      "SELECT mobile FROM users WHERE username=?",
      [username]
    );

    if (results.length === 0) return res.status(404).send("User not found");

    let mobile = results[0].mobile;
    if (!mobile.startsWith("+")) mobile = "+91" + mobile;

    const otp = generateOTP();
    otpStore[mobile] = { otp, expiresAt: Date.now() + 300000 };

    await twilioClient.messages.create({
      body: `Your verification OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile,
    });

    res.send("OTP sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send OTP");
  }
};
