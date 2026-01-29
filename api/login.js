import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const trimmedUsername = username.trim();

    // 1️⃣ Check OWNER
    let [rows] = await db.execute(
      "SELECT owner_id AS id, username, password, name FROM owners WHERE username = ?",
      [trimmedUsername]
    );

    let role = "owner";

    // 2️⃣ If not owner → check CUSTOMER
    if (rows.length === 0) {
      [rows] = await db.execute(
        "SELECT customer_id AS id, username, password, name FROM customers WHERE username = ?",
        [trimmedUsername]
      );
      role = "customer";
    }

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: user.id,
      name: user.name,
      role
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
