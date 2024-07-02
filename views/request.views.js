const ServiceRequestModel = require("../models/request.model");

class requestView {
  static createRequest = async function (serviceRequestData) {
    try {
      const newRequest = new ServiceRequestModel(serviceRequestData);
      return await newRequest.save();
    } catch (error) {
      throw error;
    }
  };
}

module.exports = requestView;
