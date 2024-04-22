const ServiceView = require("../views/service.views");

exports.fetchServicesList = async function (req, res, next) {
  try {
    const services = await ServiceView.getServicesList();
    console.log("--services--", services);
    res.status(200).json({ status: true, services: services });
  } catch (error) {
    throw error;
  }
};
