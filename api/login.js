const pool = require("./_db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, password } = req.body;

  try {
    const [results] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (results.length === 0)
      return res.status(401).send("Invalid registration number or password");

    const user = results[0];
    const valid = bcrypt.compareSync(password, user.password);

    if (!valid)
      return res.status(401).send("Invalid registration number or password");

    res.status(200).send("Login successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
