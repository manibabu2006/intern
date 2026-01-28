// _twilio.js
const twilio = require("twilio");

if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_PHONE
) {
  throw new Error("Twilio environment variables are missing");
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP SMS
 */
async function sendOTP(mobile, otp) {
  return client.messages.create({
    body: `SRM Portal OTP: ${otp} (valid for 5 minutes)`,
    from: process.env.TWILIO_PHONE,
    to: `+91${mobile}`
  });
}

module.exports = {
  sendOTP
};
