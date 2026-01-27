const pool = require("./_db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, password, mobile } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0)
      return res.status(400).send("Username already exists");

    const hashed = bcrypt.hashSync(password, 10);

    await pool.query(
      "INSERT INTO users (username, password, mobile) VALUES (?, ?, ?)",
      [username, hashed, mobile]
    );

    res.status(200).send("Registration successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
