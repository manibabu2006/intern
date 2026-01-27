const pool = require("./_db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, newPassword } = req.body;

  try {
    const hashed = bcrypt.hashSync(newPassword, 10);

    await pool.query("UPDATE users SET password=? WHERE username=?", [
      hashed,
      username,
    ]);

    res.send("Password reset successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
