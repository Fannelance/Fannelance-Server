const router = require("express").Router();
const WorkerController = require("../controller/worker.controller");
const TokenController = require("../helpers/token");

router.post(
  "/worker/register",
  TokenController.verifyWorkerToken,
  WorkerController.workerRegister
);

router.post("/worker/check-phone", WorkerController.checkWorkerPhone);

router.post(
  "/worker/login",
  TokenController.verifyWorkerToken,
  WorkerController.authenticateWorker
);

router.get(
  "/worker/data",
  TokenController.verifyWorkerToken,
  WorkerController.getWorkerData
);

router.put(
  "/worker/update-location",
  TokenController.verifyWorkerToken,
  WorkerController.updateLocation
);

router.put(
  "/worker/update-password",
  TokenController.verifyWorkerToken,
  WorkerController.updatePassword
);

router.put(
  "/worker/reset-password",
  TokenController.verifyWorkerToken,
  WorkerController.resetPassword
);

router.delete(
  "/worker/delete-account",
  TokenController.verifyWorkerToken,
  WorkerController.deleteWorkerAccount
);

module.exports = router;
