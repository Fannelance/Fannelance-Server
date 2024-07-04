const mongoose = require("mongoose");
const db = require("../config/db");

const { Schema } = mongoose;

const RequestSchema = new Schema({
  created_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ["Open", "In Progress", "Closed", "Cancelled"],
    default: "Open",
  },
  requester: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: "workers",
    required: true,
  },
});

const RequestModel = db.model("requests", RequestSchema);

module.exports = RequestModel;
