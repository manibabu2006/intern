const pool = require("./_db");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { username } = req.body;

  try {
    // Get user's mobile number
    const [rows] = await pool.query(
      "SELECT mobile FROM users WHERE username=?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const mobile = rows[0].mobile;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save OTP
    await pool.query(
      "INSERT INTO otp_codes (username, otp, expires_at) VALUES (?, ?, ?)",
      [username, otp, expires]
    );

    // Send SMS
    await client.messages.create({
      body: `SRM Portal OTP: ${otp} (valid 5 mins)`,
      from: process.env.TWILIO_PHONE,
      to: `+91${mobile}` // adjust country code if needed
    });

    res.status(200).send("OTP sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("OTP sending failed");
  }
};
