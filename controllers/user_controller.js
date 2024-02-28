const Joi = require("joi");
const logger = require("../utils/logger");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const KYC = require("../models/KYC");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

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

module.exports.update_bvn = async (req, res) => {
  const { bvn, dob } = req.body;

  const schema = Joi.object().keys({
    bvn: Joi.string().required(),
    dob: Joi.string().required(),
  });

  const data = { bvn, dob };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const user = await User.findOne().where("_id").equals(req.userId);
    const monnifyApiKey = process.env.MONNIFY_API_KEY;
    const monnifySecret = process.env.MONNIFY_SECRET_KEY;

    const monnifyBase64 = Buffer.from(
      `${monnifyApiKey}:${monnifySecret}`
    ).toString("base64");

    // generate reference
    const reference = `ERRANGO-${user._id}`;

    // Define custom headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${monnifyBase64}`,
    };

    // make axios request to monnify to verify bvn
    const monnifyResponse = await axios.post(
      "https://sandbox.monnify.com/api/v1/disbursements/wallet",
      {
        walletReference: reference,
        walletName: reference,
        customerName: user.fullName,
        bvnDetails: {
          bvn: bvn,
          bvnDateOfBirth: dob, // "1997-06-13",
        },
        customerEmail: user.email,
      },
      {
        headers,
      }
    );

    if (monnifyResponse.data.responseMessage.toLowerCase() === "success") {
      user.bvn = bvn;
      user.dob = dob;
      user.accountNumber = monnifyResponse.data.responseBody.accountNumber;
      await user.save();

      return res.json({
        success: true,
        data: user,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "BVN Verification failed, please try again",
      });
    }
  } catch (error) {
    console.log(error);
    logger.error("error");
    logger.error(error);
    return res.status(400).json({
      success: false,
      message: "BVN Verification failed, please try again",
    });
  }
};

module.exports.go_online = async (req, res) => {
  const { lat, lng } = req.body;

  const schema = Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  });

  const data = { lat, lng };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    user.isOnline = true;
    user.lat = lat;
    user.lng = lng;
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
