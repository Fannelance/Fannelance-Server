const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const { Schema } = mongoose;

const workerSchema = new Schema({
  firstname: {
    type: String,
    lowercase: true,
    required: [true, "First name is required"],
    trim: true,
  },
  lastname: {
    type: String,
    lowercase: true,
    required: [true, "Last name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Email is required"],
  },
  gender: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ["male", "female"],
    required: [true, "Gender is required"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  jobTitle: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    default: 5,
  },
  is_available: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

workerSchema.pre("save", async function () {
  try {
    this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
  } catch (error) {
    throw error;
  }
});

workerSchema.methods.comparePassword = async function (workerPassword) {
  try {
    const password = await this.get("password");
    const isMatch = await bcrypt.compare(workerPassword, password);

    return isMatch;
  } catch (error) {
    throw error;
  }
};

const WorkerModel = db.model("workers", workerSchema);

module.exports = WorkerModel;
