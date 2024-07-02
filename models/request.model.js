// serviceRequestModel.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const serviceRequestSchema = new Schema({
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_date: {
    type: Date,
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
  
  // attachments: [
  //   {
  //     file_name: {
  //       type: String,
  //       required: true,
  //       maxlength: 255,
  //     },
  //     file_url: {
  //       type: String,
  //       required: true,
  //       match: /^https?:\/\/\S+$/,
  //     },
  //   },
  // ],
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

module.exports = ServiceRequest;
