require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY_USER = process.env.JWT_SECRET_KEY_USER;
const JWT_SECRET_KEY_WORKER = process.env.JWT_SECRET_KEY_WORKER;

exports.verifyUserToken = async function (req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      JWT_SECRET_KEY_USER
    );

    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized Token" });
  }
};

exports.verifyWorkerToken = async function (req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      JWT_SECRET_KEY_WORKER
    );
    req.worker = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized Token" });
  }
};

exports.generateToken = async function (
  tokenData,
  secretKey,
  jwt_expire = "30 days"
) {
  try {
    const token = jwt.sign(tokenData, secretKey, { expiresIn: jwt_expire });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};
