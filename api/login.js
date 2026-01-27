import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).send("Invalid user");
    }

    const user = rows[0];
    const ok = bcrypt.compareSync(password, user.password);

    if (!ok) {
      return res.status(401).send("Wrong password");
    }

    res.status(200).send("Login successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
}
