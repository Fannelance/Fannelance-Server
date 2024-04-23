const router = require("express").Router();
const UserController = require("../controller/user.controller");
const TokenController = require("../controller/token.controller");

router.post(
  "/user/register",
  TokenController.verifyToken,
  UserController.register
);
router.post("/user/check-phone", UserController.checkPhoneNumber);
router.post(
  "/user/login",
  TokenController.verifyToken,
  UserController.checkPassword
);
router.get("/user", TokenController.verifyToken, UserController.getUserData);
router.put(
  "/user/update-location",
  TokenController.verifyToken,
  UserController.updateLocation
);

module.exports = router;
