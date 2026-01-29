// verify-otp.js
import db from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { username, role, otp } = req.body;

  if (!username || !role || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing fields"
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, otp, expires_at FROM otps
       WHERE username = ? AND role = ?
       LIMIT 1`,
      [username, role]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const dbOTP = rows[0].otp.toString().trim();
    const userOTP = otp.toString().trim();

    if (dbOTP !== userOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      await db.query("DELETE FROM otps WHERE id = ?", [rows[0].id]);
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // single-use OTP
    await db.query("DELETE FROM otps WHERE id = ?", [rows[0].id]);

    return res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
