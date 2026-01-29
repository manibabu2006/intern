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
    console.log("VERIFY REQUEST:", { username, role, otp });

    const [rows] = await db.query(
      `SELECT id, otp, expires_at 
       FROM otps
       WHERE username = ? AND role = ?
       LIMIT 1`,
      [username, role]
    );

    // 🔴 OTP not found
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const dbOTP = rows[0].otp.toString().trim();
    const userOTP = otp.toString().trim();

    console.log("OTP CHECK:", { dbOTP, userOTP });

    // 🔴 OTP mismatch
    if (dbOTP !== userOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // 🔴 Expired OTP
    if (new Date(rows[0].expires_at) < new Date()) {
      await db.query("DELETE FROM otps WHERE id = ?", [rows[0].id]);
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // ✅ OTP valid → delete it
    await db.query("DELETE FROM otps WHERE id = ?", [rows[0].id]);

    return res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
