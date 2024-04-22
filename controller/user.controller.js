require("dotenv").config();
const UserModel = require("../models/user.model");
const UserView = require("../views/user.views");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.jwt_SECRET_KEY;

exports.register = async function (req, res, next) {
  try {
    const { firstname, lastname, password } = req.body;
    const phone = req.user.phone;

    if (!firstname) {
      return res.status(400).json({ error: "First name is required" });
    }

    if (!lastname) {
      return res.status(400).json({ error: "Last name is required" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ error: "Invalid password. Must be at least 6 characters" });
    }

    const duplicate = await UserView.checkUser(phone);

    if (duplicate) {
      return res
        .status(409)
        .json({ error: `There is already a user with phone number ${phone}` });
    }

    const response = await UserView.registerUser(
      firstname,
      lastname,
      phone,
      password
    );

    console.log(response);

    res
      .status(200)
      .json({ status: true, message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

function isValidPassword(password) {
  return password.length >= 6;
}

exports.checkPhoneNumber = async function (req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await UserView.checkUser(phone);

    const tokenData = { phone: phone, isVerified: false };
    const token = await UserView.generateToken(tokenData, SECRET_KEY, "1h");

    if (!user) {
      return res.status(401).json({ status: false, token: token });
    }
    res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkPassword = async function (req, res, next) {
  const { password } = req.body;
  const phone = req.user.phone;

  try {
    const user = await UserModel.findOne({ phone: phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const tokenData = { phone: user.phone, isVerified: true };
    const token = await UserView.generateToken(tokenData, SECRET_KEY, "1h");

    res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateLocation = async function (req, res, next) {
  const { latitude, longitude } = req.body;
  const userId = req.user._id;

  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await UserModel.findByIdAndUpdate(userId, {
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    res.json({ message: "Location updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
