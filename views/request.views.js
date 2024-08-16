const RequestModel = require("../models/request.model");

class RequestView {
  static createRequest = async function (requestData) {
    try {
      const newRequest = new RequestModel(requestData);
      return await newRequest.save();
    } catch (error) {
      throw error;
    }
  };

  static updateRequestStatus = async function (requestId, status) {
    try {
      return await RequestModel.findByIdAndUpdate(
        { _id: requestId },
        { status: status }
      );
    } catch (error) {
      throw error;
    }
  };

  static getRequestsByUserId = async function (userId) {
    try {
      return await RequestModel.find({
        requester: userId,
        status: "In Progress",
      });
    } catch (error) {
      throw error;
    }
  };

  static getRequestsByWorkerId = async function (workerId) {
    try {
      return await RequestModel.find({
        assigned_to: workerId,
        status: "In Progress",
      });
    } catch (error) {
      throw error;
    }
  };
}

module.exports = RequestView;
