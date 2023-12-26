const Joi = require("joi");
const logger = require("../utils/logger");
const Admin = require("../models/Admin");

module.exports.create_admin = async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  const schema = Joi.object().keys({
    fullName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string()
      .regex(/^[0]\d{10}$/)
      .required()
      .messages({
        "string.pattern.base":
          'Please enter a valid Nigerian phone number starting with "0" and followed by 10 digits.',
      }),
    password: Joi.string()
      .min(8) // Minimum length of 8 characters
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/,
        "strong"
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long.",
        "string.pattern.base":
          "Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character.",
      }),
  });

  const data = { fullName, email, phoneNumber, password };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }
  try {
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
