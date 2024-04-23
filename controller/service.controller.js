const ServiceView = require("../views/service.views");

exports.fetchServicesList = async function (req, res, next) {
  const isAuth = req.user.isAuthorized;
  try {
    if (isAuth) {
      return res.status(401).json({ error: "User not Unauthorized" });
    }

    const services = await ServiceView.getServicesList();
    res.status(200).json({ status: true, services: services });
  } catch (error) {
    throw error;
  }
};
