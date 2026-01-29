import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { name, username, password, aadhaar, phone, role } = req.body;

  if (!name || !username || !password || !aadhaar || !phone || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const table = role === "owner" ? "owners" : "customers";

    // Check if username already exists
    const [exists] = await db.execute(`SELECT * FROM ${table} WHERE username = ?`, [username]);
    if (exists.length > 0) {
      return res.json({ success: false, message: "Username already taken" });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const [result] = await db.execute(
      `INSERT INTO ${table} (name, username, password, aadhaar, phone) VALUES (?, ?, ?, ?, ?)`,
      [name, username, hashed, aadhaar, phone]
    );

    const user_id = result.insertId;

    res.json({ success: true, user_id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
}
