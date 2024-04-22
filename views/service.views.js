const ServiceModel = require("../models/service.model");

class ServiceView {
  static createService = async function (
    serviceName,
    serviceIcon,
    serviceOnTap
  ) {
    try {
      const newService = new ServiceModel({
        serviceName,
        serviceIcon,
        serviceOnTap,
      });

      return await newService.save();
    } catch (error) {
      throw error;
    }
  };

  static getServicesList = async function () {
    try {
      return await ServiceModel.find();
    } catch (error) {
      throw error;
    }
  };

  static getServiceByServiceName = async function (serviceName) {
    try {
      return await ServiceModel.findOne({ serviceName });
    } catch (error) {
      throw error;
    }
  };
}

module.exports = ServiceView;
