const express = require("express");
const bodyParser = require("body-parser");
const userRoute = require("./routes/user.routes");
const serviceRoute = require("./routes/service.routes");
const OTPRoute = require("./routes/otp.routes");
const workerRoute = require("./routes/worker.routes");

const app = express();

app.use(bodyParser.json());

app.use("/", userRoute);
app.use("/", serviceRoute);
app.use("/", OTPRoute);
app.use("/", workerRoute);

module.exports = app;
