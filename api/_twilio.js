// _twilio.js
import Twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

let client = null;

if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
) {
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn("⚠️ Twilio env variables are missing. OTP sending will fail!");
}

export async function sendOTP(mobile, otp) {
  if (!client) throw new Error("Twilio is not configured properly");

  try {
    // Remove leading 0 if present, add +91
    const toNumber = mobile.startsWith("+") ? mobile : `+91${mobile.replace(/^0/, "")}`;

    const message = await client.messages.create({
      body: `RentHub OTP: ${otp} (valid for 5 minutes)`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });

    console.log("✅ OTP sent via Twilio. SID:", message.sid);
    return message;
  } catch (err) {
    console.error("❌ Twilio send error:", err);
    throw new Error("Failed to send OTP via Twilio");
  }
}
