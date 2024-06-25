require("dotenv").config();
const bcrypt = require("bcrypt");
const WorkerView = require("../views/worker.views");
const UserView = require("../views/user.views");
const validator = require("../helpers/validate");

const JWT_SECRET_KEY_WORKER = process.env.JWT_SECRET_KEY_WORKER;

exports.workerRegister = async function (req, res, next) {
  try {
    console.log(req.body);

    const { firstname, lastname, password, email, gender, location, jobTitle } =
      req.body;

    const phone = req.worker.phone;

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

    const tokenData = { _id: worker._id, phone: phone, isAuth: false };
    const token = await WorkerView.generateToken(
      tokenData,
      JWT_SECRET_KEY_WORKER
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
  const phone = req.worker.phone;

  try {
    const worker = await WorkerView.checkWorker(phone);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    const isMatch = await worker.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const tokenData = { _id: worker._id, phone: phone, isAuth: true };
    const token = await WorkerView.generateToken(
      tokenData,
      JWT_SECRET_KEY_WORKER
    );

    res.status(200).json({ status: true, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getWorkerData = async function (req, res, next) {
  const phone = req.worker.phone;
  const isAuth = req.worker.isAuth;

  try {
    const worker = await WorkerView.findWorkerByPhone(phone);

    if (!worker) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    res.status(200).json({ status: true, data: worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.findSuitableWorkers = async function (req, res, next) {
  const phone = req.user.phone;
  const userLocation = await UserView.getUserLocation(phone);
  const userCoordinates = userLocation.location.coordinates;

  try {
    const workers = await WorkerView.findSuitableWorkers(
      userCoordinates,
      "plumber"
    );

    console.log("workers", workers);

    if (!workers) {
      return res.status(404).json({ error: "Worker not found" });
    }

    res.status(200).json({ status: true, data: workers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteWorkerAccount = async function (req, res, next) {
  const phone = req.worker.phone;
  const isAuth = req.worker.isAuth;

  try {
    const worker = await WorkerView.checkWorker(phone);

    if (!worker) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    await WorkerView.findByPhoneAndDelete(phone);

    return res.status(200).json({ status: true, data: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateLocation = async function (req, res, next) {
  const { latitude, longitude } = req.body;
  const phone = req.worker.phone;

  try {
    const worker = await WorkerView.checkUser(phone);

    if (!worker) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    await WorkerView.findByPhoneAndUpdateLocation(phone, {
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
  const phone = req.worker.phone;
  const isAuth = req.worker.isAuth;

  try {
    const worker = await WorkerView.checkWorker(phone);

    if (!worker) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isAuth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    const isMatch = await worker.comparePassword(oldpassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    console.log("newpassword", newpassword);
    console.log("repeatedpassword", repeatedpassword);
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
    await WorkerView.findByPhoneAndUpdatePassword(phone, hashedNewPassword);

    return res
      .status(200)
      .json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.resetPassword = async function (req, res, next) {
  const phone = req.worker.phone;

  const { newpassword, repeatedpassword } = req.body;
  try {
    const worker = await WorkerView.checkWorker(phone);

    if (!worker) {
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
    await WorkerView.findByPhoneAndUpdatePassword(phone, hashedNewPassword);

    return res
      .status(200)
      .json({ status: true, message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.changeRating = async function (req, res, next) {
  const phone = req.worker.phone;
  const rating = req.body.rating;

  try {
    const worker = await WorkerView.checkWorker(phone);

    if (!worker) {
      return res.status(404).json({ error: "User not found" });
    }

    await WorkerView.findByphoneAndUpdateRating(phone, rating);

    return res
      .status(200)
      .json({ status: true, message: "Rating updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateAvialability = async function (req, res, next) {
  const phone = req.worker.phone;
  const availability = req.body.availability;

  try {
    const worker = await WorkerView.checkWorker(phone);

    if (!worker) {
      return res.status(404).json({ error: "User not found" });
    }

    await WorkerView.findByPhoneAndUpdateAvailability(phone, availability);

    return res
      .status(200)
      .json({ status: true, message: "Availability updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
