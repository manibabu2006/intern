import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res){
  if(req.method !== "POST"){
    return res.status(405).json({ success:false, message:"Method not allowed" });
  }

  const { name, username, password, aadhaar, phone, role } = req.body;

  if(!name || !username || !password || !aadhaar || !phone || !role){
    return res.status(400).json({ success:false, message:"All fields are required" });
  }

  try {
    // Check if username exists
    const [existing] = await db.query("SELECT username FROM users WHERE username=?", [username]);
    if(existing.length > 0){
      return res.status(400).json({ success:false, message:"Username already exists" });
    }

    // Hash password
    const hashed = bcrypt.hashSync(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (name, username, password, aadhaar, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), username.trim(), hashed, aadhaar.trim(), phone.trim(), role]
    );

    return res.status(200).json({ success:true, user_id: result.insertId });
  } catch(err){
    console.error(err);
    return res.status(500).json({ success:false, message:"Registration failed" });
  }
}
