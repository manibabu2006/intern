const pool = require("./_db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { username, currentPassword, newPassword } = req.body;

  try {
    // 1. Get user
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = rows[0];

    // 2. Verify current password
    const match = bcrypt.compareSync(currentPassword, user.password);
    if (!match) {
      return res.status(401).send("Current password is incorrect");
    }

    // 3. Hash new password
    const hashed = bcrypt.hashSync(newPassword, 10);

    // 4. Update password
    await pool.query(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashed, username]
    );

    res.status(200).send("Password changed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
