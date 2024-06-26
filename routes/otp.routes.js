const router = require("express").Router();
const OTPController = require("../helpers/otp");
const TokenController = require("../helpers/token");

router.post(
  "/user/verify-otp",
  TokenController.verifyUserToken,
  OTPController.verifyUserOTP
);
router.post(
  "/user/send-otp",
  TokenController.verifyUserToken,
  OTPController.sendUserOTP
);
router.post(
  "/worker/verify-otp",
  TokenController.verifyWorkerToken,
  OTPController.verifyWorkerOTP
);
router.post(
  "/worker/send-otp",
  TokenController.verifyWorkerToken,
  OTPController.sendWorkerOTP
);

module.exports = router;
