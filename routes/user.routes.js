const router = require("express").Router();
const UserController = require("../controller/user.controller");
const WorkerController = require("../controller/worker.controller");
const TokenController = require("../helpers/token");

router.post(
  "/user/register",
  TokenController.verifyUserToken,
  UserController.register
);
router.post("/user/check-phone", UserController.checkPhoneNumber);
router.post(
  "/user/login",
  TokenController.verifyUserToken,
  UserController.checkPassword
);
router.get(
  "/user",
  TokenController.verifyUserToken,
  UserController.getUserData
);
router.put(
  "/user/update-location",
  TokenController.verifyUserToken,
  UserController.updateLocation
);
router.put(
  "/user/update-password",
  TokenController.verifyUserToken,
  UserController.updatePassword
);
router.put(
  "/user/reset-password",
  TokenController.verifyUserToken,
  UserController.resetPassword
);
router.delete(
  "/user/delete-account",
  TokenController.verifyUserToken,
  UserController.deleteUser
);
router.get(
  "/close-workers",
  TokenController.verifyUserToken,
  WorkerController.findSuitableWorkers
);
router.get(
  "/user/requests",
  TokenController.verifyUserToken,
  UserController.getUserRequests
);
module.exports = router;
