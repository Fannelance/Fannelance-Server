const router = require("express").Router();
const serviceController = require("../controller/service.controller");
const TokenController = require("../controller/token.controller");

router.get(
  "/services-list",
  TokenController.verifyToken,
  serviceController.fetchServicesList
);

module.exports = router;
