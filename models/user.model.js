const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const { Schema } = mongoose;

const userSchema = new Schema({
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
  avatar: {
    data: Buffer,
    contentType: String,
  },
});

userSchema.pre("save", async function () {
  try {
    this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (userPassword) {
  try {
    const password = await this.get("password");
    console.log(userPassword);
    const isMatch = await bcrypt.compare(userPassword, password);

    return isMatch;
  } catch (error) {
    throw error;
  }
};

const UserModel = db.model("users", userSchema);

module.exports = UserModel;
