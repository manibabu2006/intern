const pool = require("./_db");

module.exports = async (req, res) => {
  const { username, otp } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE username=? AND otp=? AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [username, otp]
    );

    if (rows.length === 0) {
      return res.status(400).send("Invalid or expired OTP");
    }

    res.status(200).send("OTP verified");
  } catch (err) {
    res.status(500).send("OTP verification failed");
  }
};
