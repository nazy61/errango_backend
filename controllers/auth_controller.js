const Joi = require("joi");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const Admin = require("../models/Admin");
const Role = require("../models/Role");
const User = require("../models/User");
const Verification = require("../models/Verification");
const Wallet = require("../models/Wallet");
const {
  generateToken,
  generateOtpId,
  getOtpData,
} = require("../middlewares/auth");

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
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const role = await Role.findOne().where("name").equals("admin");

    const admin = await Admin.create({
      roleId: role._id,
      ...data,
      password: hashedPassword,
    });

    return res.json({
      success: true,
      data: { ...admin._doc, password: undefined },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.login_admin = async (req, res) => {
  const { identifier, password } = req.body;

  const schema = Joi.object().keys({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
  });

  const data = { identifier, password };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (admin) {
      const auth = await bcrypt.compare(password, admin.password);

      if (auth) {
        const token = generateToken(admin._id);

        return res.json({
          success: true,
          data: { ...admin._doc, password: undefined },
          token,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Wrong credentials, Please try again",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Wrong credentials, Please try again",
      });
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.create_user = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const schema = Joi.object().keys({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
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

  const data = { firstName, lastName, email, phoneNumber, password };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const otpToken = generateOtpId(data);

    Verification.create({
      identifier: data.phoneNumber,
      otp: "123456",
      type: "phone",
    });

    return res.json({
      success: true,
      data: { otpToken },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.resend_otp = async (req, res) => {
  const { otpToken } = req.body;

  const schema = Joi.object().keys({
    otpToken: Joi.string().required(),
  });

  const data = { otpToken };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const userData = getOtpData(otpToken);

    if (userData) {
      const verification = await Verification.findOne()
        .where("identifier")
        .equals(userData.phoneNumber);

      const otp = "123456";

      verification.otp = otp;

      await verification.save();

      return res.json({
        success: true,
        message: "OTP Resent",
        data: { otpToken },
      });
    }

    return res.status(500).json({
      success: false,
      data: "Something went wrong, please try again",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.verify_otp = async (req, res) => {
  const { otpToken, otp } = req.body;

  const schema = Joi.object().keys({
    otpToken: Joi.string().required(),
    otp: Joi.string().min(6).required(),
  });

  const data = { otpToken, otp };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const userData = getOtpData(otpToken);

    if (userData) {
      if (otp === "123456") {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const role = await Role.findOne().where("name").equals("user");
        const verification = await Verification.findOne()
          .where("identifier")
          .equals(userData.phoneNumber);

        verification.isVerified = true;

        verification.save();

        const user = await User.create({
          roleId: role._id,
          ...userData,
          fullName: `${userData.firstName} ${userData.lastName}`,
          accountNumber: userData.phoneNumber.slice(-10),
          password: hashedPassword,
        });

        await Wallet.create({
          user: user._id,
          type: "errango_wallet",
          balance: 0.0,
        });

        await Wallet.create({
          user: user._id,
          type: "runner_wallet",
          balance: 0.0,
        });

        const token = generateToken(user._id);

        return res.json({
          success: true,
          data: { ...user._doc, password: undefined },
          token,
        });
      }
    }

    return res.status(500).json({
      success: false,
      data: "Something went wrong, please try again",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.set_pin = async (req, res) => {
  const { pin } = req.body;

  const schema = Joi.object().keys({
    pin: Joi.string().min(4).required(),
  });

  const data = { pin };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const user = await User.findOne().where("_id").equals(req.userId);
    user.pin = pin;

    await user.save();

    return res.json({
      success: true,
      message: "Pin set successfully",
      data: {},
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.forgot_password = async (req, res) => {
  const { identifier } = req.body;

  const schema = Joi.object().keys({
    identifier: Joi.string().required(),
  });

  const data = { identifier };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpToken = generateOtpId(user._id);

    const verification = await Verification.findOne()
      .where("identifier")
      .equals(user.phoneNumber);

    const otp = "123456";

    verification.otp = otp;
    verification.isVerified = false;

    await verification.save();

    return res.json({
      success: true,
      data: { otpToken },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.forgot_password_verify_otp = async (req, res) => {
  const { otpToken, otp } = req.body;

  const schema = Joi.object().keys({
    otpToken: Joi.string().required(),
    otp: Joi.string().min(6).required(),
  });

  const data = { otpToken, otp };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const userId = getOtpData(otpToken);

    if (userId) {
      if (otp === "123456") {
        const user = await User.findOne().where("_id").equals(userId);

        const token = generateToken(user._id);

        return res.json({
          success: true,
          token,
        });
      }
    }

    return res.status(500).json({
      success: false,
      data: "Something went wrong, please try again",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.forgot_password_resend_otp = async (req, res) => {
  const { otpToken } = req.body;

  const schema = Joi.object().keys({
    otpToken: Joi.string().required(),
  });

  const data = { otpToken };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const userId = getOtpData(otpToken);

    if (userId) {
      const user = await User.findOne().where("_id").equals(userId);

      const verification = await Verification.findOne()
        .where("identifier")
        .equals(user.phoneNumber);

      const otp = "123456";

      verification.otp = otp;
      await verification.save();

      return res.json({
        success: true,
        message: "OTP Resent",
        data: { otpToken },
      });
    }

    return res.status(500).json({
      success: false,
      data: "Something went wrong, please try again",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.forgot_password_create_password = async (req, res) => {
  const { password, pin } = req.body;

  const schema = Joi.object().keys({
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
    pin: Joi.string().min(4).required(),
  });

  const data = { password, pin };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    if (pin === user.pin) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;

      user.save();

      return res.json({
        success: true,
        message: "Password Changed",
      });
    }

    return res.status(500).json({
      success: false,
      data: "Something went wrong, please try again",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.user_login = async (req, res) => {
  const { identifier, password } = req.body;

  const schema = Joi.object().keys({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
  });

  const data = { identifier, password };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (user) {
      const auth = await bcrypt.compare(password, user.password);

      if (auth) {
        const token = generateToken(user._id);

        return res.json({
          success: true,
          data: { ...user._doc, password: undefined },
          token,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Wrong credentials, Please try again",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Wrong credentials, Please try again",
      });
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
