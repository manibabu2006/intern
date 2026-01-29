import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, username, password, aadhaar, phone, role } = req.body;

  if (!name || !username || !password || !aadhaar || !phone || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const cleanRole = role.toLowerCase();
    const table = cleanRole === "owner" ? "owners" : "customers";

    // Trim inputs
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedAadhaar = aadhaar.trim();
    const trimmedPhone = phone.trim();

    // Check if username already exists
    const [exists] = await db.execute(`SELECT 1 FROM ${table} WHERE username = ?`, [trimmedUsername]);
    if (exists.length > 0) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }

    // Hash password asynchronously
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO ${table} (name, username, password, aadhaar, phone) VALUES (?, ?, ?, ?, ?)`,
      [trimmedName, trimmedUsername, hashedPassword, trimmedAadhaar, trimmedPhone]
    );

    const user_id = result.insertId;

    res.status(201).json({ success: true, user_id });
  } catch (err) {
    console.error("REGISTRATION ERROR:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
}
