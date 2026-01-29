// verify-otp.js
import db from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const { username, role, otp } = req.body;

  if (!username || !role || !otp) {
    return res.status(400).json({
      success: false,
      message: "Username, role, and OTP are required"
    });
  }

  try {
    // 1️⃣ Fetch OTP
    const [rows] = await db.query(
      `SELECT id, expires_at 
       FROM otps 
       WHERE username = ? AND role = ? AND otp = ?
       LIMIT 1`,
      [username, role, otp.toString()]
    );

    // 2️⃣ Invalid OTP
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const { id, expires_at } = rows[0];

    // 3️⃣ Expired OTP
    if (new Date(expires_at) < new Date()) {
      await db.query("DELETE FROM otps WHERE id = ?", [id]);

      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // 4️⃣ OTP valid → delete it (single-use)
    await db.query("DELETE FROM otps WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP"
    });
  }
}
