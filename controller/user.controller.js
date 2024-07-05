require("dotenv").config();
const bcrypt = require("bcrypt");
const UserView = require("../views/user.views");
const validator = require("../helpers/validate");
const { sendWelcomingMail } = require("../helpers/email");
const RequestView = require("../views/request.views");
const WorkerView = require("../views/worker.views");

const JWT_SECRET_KEY_USER = process.env.JWT_SECRET_KEY_USER;

exports.register = async function (req, res, next) {
  try {
    const { firstname, lastname, password, email, gender, location } = req.body;
    const phone = req.user.phone;

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

    await UserView.registerUser({
      firstname,
      lastname,
      phone,
      email,
      gender,
      password,
      location,
    });
    await sendWelcomingMail(firstname, email);

    return res
      .status(200)
      .json({ status: true, message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkPhoneNumber = async function (req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await UserView.checkUser(phone);

    const tokenData = { phone: phone, isAuth: false };
    const token = await UserView.generateToken(tokenData, JWT_SECRET_KEY_USER);

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

    const tokenData = { _id: user._id, phone: phone, isAuth: true };
    const token = await UserView.generateToken(tokenData, JWT_SECRET_KEY_USER);

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
  const { oldpassword, newpassword, repeatedpassword } = req.body;
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

    const isMatch = await user.comparePassword(oldpassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    if (newpassword !== repeatedpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!validator.validatePassword(newpassword)) {
      return res
        .status(400)
        .json({ error: "Invalid password. Please, Enter a strong password" });
    }

    const hashedNewPassword = await bcrypt.hash(
      newpassword,
      await bcrypt.genSalt(10)
    );
    await UserView.findByPhoneAndUpdatePassword(phone, hashedNewPassword);

    return res
      .status(200)
      .json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.resetPassword = async function (req, res, next) {
  const phone = req.user.phone;

  const { newpassword, repeatedpassword } = req.body;
  try {
    const user = await UserView.checkUser(phone);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (newpassword !== repeatedpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!validator.validatePassword(newpassword)) {
      return res
        .status(400)
        .json({ error: "Invalid password. Please, Enter a strong password" });
    }

    const hashedNewPassword = await bcrypt.hash(
      newpassword,
      await bcrypt.genSalt(10)
    );
    await UserView.findByPhoneAndUpdatePassword(phone, hashedNewPassword);

    const tokenData = { _id: user._id, phone: phone, isAuth: true };
    const token = await UserView.generateToken(tokenData, JWT_SECRET_KEY_USER);

    return res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserRequests = async function (req, res, next) {
  const userId = req.user._id;
  const workers = [];

  try {
    const requests = await RequestView.getRequestsByUserId(userId);
    console.log(userId);

    const workerPromises = requests.map(async (request) => {
      const workerId = request.assigned_to;
      const worker = await WorkerView.getWorkerById(workerId);

      return {
        _id: worker._id,
        firstname: worker.firstname,
        lastname: worker.lastname,
        phone: worker.phone,
        email: worker.email,
        jobTitle: worker.jobTitle,
        gender: worker.gender,
        rate: worker.rate,
        request_date: request.created_date,
      };
    });

    const workerDetails = await Promise.all(workerPromises);
    console.log(workerDetails);

    workerDetails.forEach((worker) => workers.push(worker));

    return res.status(200).json({ status: true, data: workers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
