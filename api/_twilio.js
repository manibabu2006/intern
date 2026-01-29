// _twilio.js
import Twilio from "twilio";
import dotenv from "dotenv";

dotenv.config(); // ensure env variables are loaded

let client = null;

if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
) {
  client = Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  console.warn(
    "⚠️ Twilio environment variables are missing. OTP sending will fail."
  );
}

/**
 * Send OTP SMS via Twilio
 * @param {string} mobile - recipient mobile number (without country code)
 * @param {string|number} otp - OTP to send
 * @param {string} [countryCode='+91'] - optional country code
 */
export async function sendOTP(mobile, otp, countryCode = "+91") {
  if (!client) {
    throw new Error(
      "Twilio environment variables are missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE."
    );
  }

  try {
    const toNumber = mobile.startsWith("+") ? mobile : `${countryCode}${mobile}`;

    const message = await client.messages.create({
      body: `RentHub OTP: ${otp} (valid for 5 minutes)`,
      from: process.env.TWILIO_PHONE,
      to: toNumber,
    });

    console.log(`✅ OTP sent to ${toNumber}, SID: ${message.sid}`);
    return message;
  } catch (err) {
    console.error("❌ Twilio send error:", err);
    throw new Error("Failed to send OTP via Twilio");
  }
}
