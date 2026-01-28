import pool from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, otp } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM otp_table WHERE username = ? AND otp = ? AND expires_at > NOW()",
      [username, otp]
    );

    if (rows.length === 0) {
      return res.status(401).send("Invalid or expired OTP");
    }

    res.status(200).send("OTP verified");

  } catch (err) {
    console.error(err);
    res.status(500).send("Verification failed");
  }
}
