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
  console.warn("⚠️ Twilio environment variables are missing");
}

/**
 * Send OTP via Twilio
 * @param {string} mobile - recipient number
 * @param {number} otp - 6-digit OTP
 */
export async function sendOTP(mobile, otp) {
  if (!client) throw new Error("Twilio is not configured properly");

  try {
    // Ensure Indian format, remove leading 0
    const toNumber = mobile.startsWith("+") ? mobile : `+91${mobile.replace(/^0/, "")}`;

    const message = await client.messages.create({
      body: `RentHub OTP: ${otp} (valid for 5 minutes)`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });

    console.log("✅ OTP sent. SID:", message.sid);
    return message;
  } catch (err) {
    console.error("❌ Twilio send error:", err);
    throw new Error("Failed to send OTP via Twilio");
  }
}
