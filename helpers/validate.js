const validator = require("validator");

exports.validateEmail = function (email) {
  return validator.isEmail(email);
};

exports.validatePassword = function validatePassword(password) {
  const options = {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  };
  return validator.isStrongPassword(password, options);
};
