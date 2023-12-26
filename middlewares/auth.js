require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_KEY;

module.exports.generateToken = (userId) => {
  return jwt.sign({ userId }, secretKey, {
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

    req.userId = data.userId;
    next();
  });
};

module.exports.generateOtpId = (data) => {
  return jwt.sign({ data }, secretKey, {
    expiresIn: 60 * 10,
  });
};

module.exports.getOtpData = (otpToken) => {
  if (!otpToken) {
    throw new Error("Forbidden: Invalid token");
  }

  const data = jwt.verify(otpToken, secretKey, (err, data) => {
    if (err) {
      throw new Error("Forbidden: Invalid token");
    }

    return data.data;
  });

  return data;
};
