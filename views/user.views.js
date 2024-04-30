const UserModel = require("../models/user.model");
const TokenController = require("../helpers/token");

class UserView {
  static registerUser = async function (firstname, lastname, phone, password) {
    try {
      const createUser = new UserModel({
        firstname,
        lastname,
        phone,
        password,
      });

      return await createUser.save();
    } catch (error) {
      throw error;
    }
  };

  static checkUser = async function (phone) {
    try {
      return await UserModel.findOne({ phone });
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndDelete = async function (phone) {
    try {
      return await UserModel.findOneAndDelete({ phone });
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndUpdateLocation = async function (phone, location) {
    try {
      return await UserModel.findOneAndUpdate(
        { phone },
        { location: location }
      );
    } catch (error) {
      throw error;
    }
  };

  static findByPhoneAndUpdatePassword = async function (phone, password) {
    try {
      return await UserModel.findOneAndUpdate(
        { phone },
        { password: password }
      );
    } catch (error) {
      throw error;
    }
  };

  static generateToken = TokenController.generateToken;
}

module.exports = UserView;
