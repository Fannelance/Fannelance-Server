require("dotenv").config();
const twilio = require("twilio");
const TokenController = require("./token.controller");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.sendOTP = async function (req, res, next) {
  try {
    const phone = req.user.phone;

    const verification = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    if (verification.status === "pending") {
      res.json({ status: true, message: "Code sent successfully" });
    } else {
      res.status(400).json({
        error: "There was an issue sending your code. Please, try again",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(499).json({ error: "Internal server error" });
  }
};

exports.verifyOTP = async function (req, res, next) {
  try {
    const { code } = req.body;
    const phone = req.user.phone;

    const verificationCheck = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code: code });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ error: "Invalid code. Please, try again" });
    }

    res
      .status(200)
      .json({ status: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error in verify OTP function:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
