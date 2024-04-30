require("dotenv").config();
const UserView = require("../views/user.views");
const validator = require("../helpers/validate");

const SECRET_KEY = process.env.jwt_SECRET_KEY;

exports.register = async function (req, res, next) {
  try {
    const { firstname, lastname, password, email, gender } = req.body;
    const phone = req.user.phone;

    if (!res.status) {
      return res.status(400).json({ error: "OTP verification is required" });
    }

    if (!firstname) {
      return res.status(400).json({ error: "First name is required" });
    }

    if (!lastname) {
      return res.status(400).json({ error: "Last name is required" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!validator.validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (!gender) {
      return res.status(400).json({ error: "Gender is required" });
    }

    if (!validator.validatePassword(password)) {
      return res.status(400).json({ error: "Invalid password." });
    }

    const duplicate = await UserView.checkUser(phone);

    if (duplicate) {
      return res
        .status(409)
        .json({ error: `There is already a user with phone number ${phone}` });
    }

    await UserView.registerUser(firstname, lastname, phone, password);

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

    const tokenData = { phone: phone, isAuth: false };
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
    const user = await UserView.checkUser(phone);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const tokenData = { phone: phone, isAuth: true };
    const token = await UserView.generateToken(tokenData, SECRET_KEY, "1h");

    res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserData = async function (req, res, next) {
  const phone = req.user.phone;
  const isAuth = req.user.isAuth;

  try {
    const user = await UserView.checkUser(phone);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    res.status(200).json({ status: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteUser = async function (req, res, next) {
  const phone = req.user.phone;
  const isAuth = req.user.isAuth;

  try {
    const user = await UserView.checkUser(phone);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    const response = await UserView.findByPhoneAndDelete(phone);

    return res.status(200).json({ status: true, data: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateLocation = async function (req, res, next) {
  const { latitude, longitude } = req.body;
  const phone = req.user.phone;

  try {
    const user = await UserView.checkUser(phone);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    await UserView.findByPhoneAndUpdateLocation(phone, {
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    res.status(200).json({ message: "Location updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updatePassword = async function (req, res, next) {
  const { oldPassword, newPassword } = req.body;
  const phone = req.user.phone;

  try {
    const user = await UserView.checkUser(phone);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (!validator.validatePassword(newPassword)) {
      return res
        .status(400)
        .json({ error: "Invalid password. Must be at least 6 characters" });
    }

    await UserView.findByPhoneAndUpdatePassword(phone, newPassword);

    return res
      .status(200)
      .json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
