require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_KEY;

module.exports.generateToken = (userUUID) => {
  return jwt.sign({ uuid: userUUID }, secretKey, {
    expiresIn: "1h",
  });
};

module.exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  jwt.verify(token, secretKey, (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    req.uuid = data.uuid;
    next();
  });
};
