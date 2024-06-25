const router = require("express").Router();
const OTPController = require("../helpers/otp");
const TokenController = require("../helpers/token");

router.post(
  "/user/verify-otp",
  TokenController.verifyUserToken,
  OTPController.verifyOTP
);
router.post(
  "/user/send-otp",
  TokenController.verifyUserToken,
  OTPController.sendOTP
);
router.post(
  "/worker/verify-otp",
  TokenController.verifyWorkerToken,
  OTPController.verifyOTP
);
router.post(
  "/worker/send-otp",
  TokenController.verifyWorkerToken,
  OTPController.sendOTP
);

module.exports = router;
