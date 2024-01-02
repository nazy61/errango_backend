const Joi = require("joi");
const logger = require("../utils/logger");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const KYC = require("../models/KYC");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.get_users = async (req, res) => {
  try {
    const users = await User.find();

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_user = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne().where("_id").equals(userId);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_me = async (req, res) => {
  try {
    const user = await User.findOne().where("_id").equals(req.userId);
    const errangoWallet = await Wallet.findOne({
      $and: [{ user: req.userId }, { type: "errango_wallet" }],
    });
    const runnerWallet = await Wallet.findOne({
      $and: [{ user: req.userId }, { type: "runner_wallet" }],
    });
    const kyc = await KYC.findOne({
      $and: [{ userId: req.userId }],
    });

    return res.json({
      success: true,
      data: { user, errangoWallet, runnerWallet, kyc },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_user_runner_wallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      $and: [{ user: req.userId }, { type: "runner_wallet" }],
    });

    return res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_user_errango_wallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      $and: [{ user: req.userId }, { type: "errango_wallet" }],
    });

    return res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.update_profile_picture = async (req, res) => {
  // Joi schema for file validation
  const fileSchema = Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string().valid("image/jpeg", "image/png", "image/webp"),
    buffer: Joi.binary(),
  }).unknown(true);

  try {
    const { error, value } = fileSchema.validate(req.file);

    if (error) {
      if (error) {
        return res.status(400).send({
          success: false,
          message: error.details[0].message,
        });
      }
    }

    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto", // or 'image', 'video', 'raw'
          public_id: `errango/profile/${req.file.originalname}`, // Optional: specify a folder in Cloudinary
        },
        async (error, result) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          } else {
            const user = await User.findOne().where("_id").equals(req.userId);

            user.profilePicture = result.url;
            user.save();

            return res.json({
              success: true,
              data: "Profile Image updated",
            });
          }
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.go_online = async (req, res) => {
  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    user.isOnline = true;
    await user.save();

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.go_offline = async (req, res) => {
  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    user.isOnline = false;
    await user.save();

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.disable_account = async (req, res) => {
  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    user.disable = true;
    await user.save();

    return res.json({
      success: true,
      message: "Account Disabled",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
