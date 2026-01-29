// _twilio.js
import Twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
  throw new Error("Twilio environment variables are missing");
}

const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendOTP(mobile, otp) {
  try {
    const message = await client.messages.create({
      body: `RentHub OTP: ${otp} (valid for 5 minutes)`,
      from: process.env.TWILIO_PHONE,
      to: `+91${mobile}`
    });
    return message;
  } catch (err) {
    console.error("Twilio send error:", err);
    throw new Error("Failed to send OTP via Twilio");
  }
}
