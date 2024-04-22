require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.jwt_SECRET_KEY;

exports.verifyToken = async function (req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    console.log("decoded", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized Token" });
  }
};

exports.generateToken = async function (tokenData, secretKey, jwt_expire) {
  try {
    const token = jwt.sign(tokenData, secretKey, { expiresIn: jwt_expire });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};