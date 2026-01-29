// _twilio.js
import Twilio from "twilio";

let client = null;

if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE
) {
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn(
    "Twilio environment variables are missing. OTP sending will fail."
  );
}

export async function sendOTP(mobile, otp) {
  if (!client) {
    throw new Error(
      "Twilio environment variables are missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE."
    );
  }

  try {
    const message = await client.messages.create({
      body: `RentHub OTP: ${otp} (valid for 5 minutes)`,
      from: process.env.TWILIO_PHONE,
      to: `+91${mobile}`,
    });
    return message;
  } catch (err) {
    console.error("Twilio send error:", err);
    throw new Error("Failed to send OTP via Twilio");
  }
}
