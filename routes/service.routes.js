const router = require("express").Router();
const serviceController = require("../controller/service.controller");
const TokenController = require("../helpers/token");

router.get(
  "/services-list",
  TokenController.verifyUserToken,
  serviceController.fetchServicesList
);

module.exports = router;
