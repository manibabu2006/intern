const pool = require("./_db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const hashed = bcrypt.hashSync(newPassword, 10);

    await pool.query(
      "UPDATE users SET password=? WHERE username=?",
      [hashed, username]
    );

    await pool.query("DELETE FROM otp_codes WHERE username=?", [username]);

    res.send("Password reset successful");
  } catch (err) {
    res.status(500).send("Password reset failed");
  }
};
