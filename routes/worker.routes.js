const router = require("express").Router();
const WorkerController = require("../controller/worker.controller");
const UserController = require("../controller/user.controller");
const TokenController = require("../helpers/token");

router.post(
  "/worker/register",
  TokenController.verifyToken,
  WorkerController.workerRegister
);

router.post("/worker/check-phone", WorkerController.checkWorkerPhone);

router.post(
  "/worker/login",
  TokenController.verifyToken,
  WorkerController.authenticateWorker
);

router.get(
  "/worker/data",
  TokenController.verifyToken,
  WorkerController.getWorkerData
);

router.get(
  "/close-worker",
  TokenController.verifyToken,
  WorkerController.findSuitableWorkers
);

// router.put(
//   "/worker/update-location",
//   TokenController.verifyToken,
//   UserController.updateLocation
// );

// router.put(
//   "/worker/update-password",
//   TokenController.verifyToken,
//   UserController.updatePassword
// );

// router.put(
//   "/worker/reset-password",
//   TokenController.verifyToken,
//   UserController.resetPassword
// );

router.delete(
  "/worker/delete-account",
  TokenController.verifyToken,
  WorkerController.deleteWorkerAccount
);

module.exports = router;
