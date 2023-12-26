const logger = require("../utils/logger");

const log = (req, res, next) => {
  logger.info(req.originalUrl);
  next();
};

module.exports = log;
