const pool = require("./_db");
const otpStore = require("./_otpstore");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, otp } = req.body;

  try {
    const [results] = await pool.query(
      "SELECT mobile FROM users WHERE username=?",
      [username]
    );

    if (results.length === 0) return res.status(404).send("User not found");

    let mobile = results[0].mobile;
    if (!mobile.startsWith("+")) mobile = "+91" + mobile;

    const stored = otpStore[mobile];

    if (stored && stored.otp === otp && stored.expiresAt > Date.now()) {
      delete otpStore[mobile];
      res.send("Mobile verified successfully");
    } else {
      res.status(400).send("Invalid or expired OTP");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
