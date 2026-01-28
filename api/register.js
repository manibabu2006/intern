import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

/* ---------- DB CONNECTION ---------- */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

/* ---------- REGISTER HANDLER ---------- */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { username, password, mobile, role } = req.body;

  if (!username || !password || !mobile || !role) {
    return res.status(400).send("All fields are required");
  }

  try {
    /* Check if user already exists */
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).send("User already exists");
    }

    /* Hash password */
    const hashedPassword = bcrypt.hashSync(password, 10);

    /* Insert user */
    await pool.query(
      "INSERT INTO users (username, password, mobile, role) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, mobile, role]
    );

    return res.status(200).send("Registration successful");

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).send("Database error");
  }
}
