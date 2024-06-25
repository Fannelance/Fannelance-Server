const WorkerModel = require("../models/worker.model");
const TokenController = require("../helpers/token");

class WorkerView {
  static registerUser = async function (userData) {
    try {
      const createUser = new WorkerModel(userData);

      return await createUser.save();
    } catch (error) {
      throw error;
    }
  };

  static checkWorker = async function (phone) {
    try {
      return await WorkerModel.findOne({ phone });
    } catch (error) {
      throw error;
    }
  };

  static findWorkerByPhone = async function (phone) {
    try {
      return await WorkerModel.findOne({ phone }, { password: 0 });
    } catch (error) {
      throw error;
    }
  };

  static findSuitableWorkers = async function (userLocation, jobTitle) {
    try {
      return await WorkerModel.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: userLocation,
            },
            distanceField: "distance",
            maxDistance: 30000,
            query: { is_available: true, jobTitle: jobTitle },
            spherical: true,
          },
        },
        { $project: { password: 0 } },
        {
          $limit: 3,
        },
      ]);
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndDelete = async function (phone) {
    try {
      return await WorkerModel.findOneAndDelete({ phone });
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndUpdateLocation = async function (phone, location) {
    try {
      return await WorkerModel.findOneAndUpdate(
        { phone },
        { location: location }
      );
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndUpdatePassword = async function (phone, password) {
    try {
      return await WorkerModel.findOneAndUpdate(
        { phone },
        { password: password }
      );
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndUpdateAvailability = async function (
    phone,
    availability
  ) {
    try {
      return await Worker.findOneAndUpdate(
        { phone },
        { is_available: availability }
      );
    } catch (error) {
      throw error;
    }
  };

  static findByphoneAndUpdateRating = async function (phone, rate) {
    try {
      return await Worker.findOneAndUpdate({ phone }, { rate: rate });
    } catch (error) {
      throw error;
    }
  };

  static generateToken = TokenController.generateToken;
}

module.exports = WorkerView;
