const pool = require("./_db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, currentPassword, newPassword } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT password FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) return res.status(404).send("User not found");

    const valid = bcrypt.compareSync(currentPassword, users[0].password);
    if (!valid) return res.status(401).send("Current password incorrect");

    const hashed = bcrypt.hashSync(newPassword, 10);
    await pool.query("UPDATE users SET password=? WHERE username=?", [
      hashed,
      username,
    ]);

    res.send("Password changed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
