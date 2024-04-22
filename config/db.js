require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const dbConnection = mongoose
  .createConnection(MONGO_URI)
  .on("open", function () {
    console.log("MongoDB connected successfully");
  })
  .on("error", function () {
    console.log(
      "MongoDB connection error. Please make sure MongoDB is running."
    );
  });

module.exports = dbConnection;
