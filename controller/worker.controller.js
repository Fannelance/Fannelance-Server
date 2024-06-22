require("dotenv").config();
const bcrypt = require("bcrypt");
const WorkerView = require("../views/worker.views");
const validator = require("../helpers/validate");

const SECRET_KEY = process.env.jwt_SECRET_KEY;

exports.workerRegister = async function (req, res, next) {
  try {
    console.log(req.body);

    const { firstname, lastname, password, email, gender, location, jobTitle } =
      req.body;

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

    const duplicate = await WorkerView.checkWorker(phone);

    if (duplicate) {
      return res
        .status(409)
        .json({ error: `There is already a user with phone number ${phone}` });
    }

    await WorkerView.registerUser({
      firstname,
      lastname,
      phone,
      email,
      gender,
      password,
      location,
      jobTitle,
    });

    res
      .status(200)
      .json({ status: true, message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkWorkerPhone = async function (req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const worker = await WorkerView.checkWorker(phone);

    const tokenData = { phone: phone, isAuth: false };
    const token = await WorkerView.generateToken(
      tokenData,
      SECRET_KEY,
      "30 days"
    );

    if (!worker) {
      return res.status(401).json({ status: false, token: token });
    }

    res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.authenticateWorker = async function (req, res, next) {
  const { password } = req.body;
  const phone = req.user.phone;

  try {
    const worker = await WorkerView.checkWorker(phone);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    const isMatch = await worker.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const tokenData = { phone: phone, isAuth: true };
    const token = await WorkerView.generateToken(tokenData, SECRET_KEY, "1h");

    res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getWorkerData = async function (req, res, next) {
  const phone = req.user.phone;
  const isAuth = req.user.isAuth;

  try {
    const user = await WorkerView.checkWorker(phone);

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

exports.findSuitableWorkers = async function (req, res, next) {
  const location = req.body.location;
  const jobTitle = req.body.jobTitle;
  console.log(jobTitle);

  try {
    const workers = await WorkerView.findSuitableWorkers(location, jobTitle);

    if (!workers) {
      return res.status(404).json({ error: "Worker not found" });
    }

    console.log(workers);

    res.status(200).json({ status: true, data: workers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteWorkerAccount = async function (req, res, next) {
  const phone = req.user.phone;
  const isAuth = req.user.isAuth;

  try {
    const user = await WorkerView.checkWorker(phone);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    const response = await WorkerView.findByPhoneAndDelete(phone);

    return res.status(200).json({ status: true, data: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
