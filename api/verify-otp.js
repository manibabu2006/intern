const { verifyOTP, deleteOTP } = require("./_otpstore");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, otp } = req.body;
  if (!username || !otp) return res.status(400).send("Username and OTP required");

  try {
    const valid = await verifyOTP(username, otp);
    if (!valid) return res.status(401).send("Invalid or expired OTP");

    await deleteOTP(username); // OTP is one-time use
    res.status(200).send("OTP verified");
  } catch (err) {
    console.error(err);
    res.status(500).send("Verification failed");
  }
};
