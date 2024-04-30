const router = require("express").Router();
const OTPController = require("../helpers/otp");
const TokenController = require("../helpers/token");

router.post(
  "/verify-otp",
  TokenController.verifyToken,
  OTPController.verifyOTP
);
router.post("/send-otp", TokenController.verifyToken, OTPController.sendOTP);

module.exports = router;
