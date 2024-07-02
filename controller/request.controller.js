exports.createRequest = async function (req, res, next) {
  const serviceRequestData = {
    request_id: req.body.request_id,
    created_date: new Date(),
    status: "Open",
    requester: req.body.userID,
    assigned_to: req.body.workerID,
  };

  try {
    const newRequest = await requestView.createRequest(serviceRequestData);
    res.status(200).json({ status: true, data: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
