const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const TokenController = require("../controller/token.controller");

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

  static generateToken = TokenController.generateToken;
}

module.exports = UserView;
