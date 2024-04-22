const mongoose = require("mongoose");
const db = require("../config/db");

const { Schema } = mongoose;

const serviceSchema = new Schema({
  serviceName: {
    type: String,
    required: [true, "Service name is required"],
  },
  serviceIcon: {
    type: String,
    required: [true, "Service icon is required"],
  },
  serviceOnTap: {
    type: String,
  },
});

const ServiceModel = db.model("services", serviceSchema);

module.exports = ServiceModel;
