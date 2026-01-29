import db from "./_db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, role, currentPassword, newPassword } = req.body;
  if (!username || !role || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const cleanRole = role.toLowerCase();
    const table = cleanRole === "owner" ? "owners" : "customers";

    // 1️⃣ Get user password
    const [rows] = await db.execute(
      `SELECT ${cleanRole === "owner" ? "owner_id" : "customer_id"} AS id, password 
       FROM ${table} WHERE username = ?`,
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    // 2️⃣ Verify current password asynchronously
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    // 3️⃣ Hash new password asynchronously
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password
    await db.execute(
      `UPDATE ${table} SET password = ? WHERE username = ?`,
      [hashedPassword, username.trim()]
    );

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
