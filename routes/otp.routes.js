const router = require("express").Router();
const OTPController = require("../controller/otp.controller");
const TokenController = require("../controller/token.controller");

router.post(
  "/verify-otp",
  TokenController.verifyToken,
  OTPController.verifyOTP
);
router.post("/send-otp", TokenController.verifyToken, OTPController.sendOTP);

module.exports = router;
