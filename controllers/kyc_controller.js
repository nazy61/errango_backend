const logger = require("../utils/logger");
const KYC = require("../models/KYC");
const Joi = require("joi");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.get_user_kyc = async (req, res) => {
  const { userId } = req.params;

  try {
    const kyc = await KYC.findOne().where("userId").equals(userId);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    return res.json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_kycs = async (req, res) => {
  try {
    const kycs = await KYC.find();

    return res.json({
      success: true,
      data: kycs,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.create_user_kyc = async (req, res) => {
  const { docType, docIdNumber, dob, residentialAddress } = req.body;

  const schema = Joi.object().keys({
    docType: Joi.string().required(),
    docIdNumber: Joi.string().required(),
    dob: Joi.string().required(),
    residentialAddress: Joi.string().required(),
  });

  // Joi schema for file validation
  const fileSchema = Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    buffer: Joi.binary(),
  }).unknown(true);

  const data = { docType, docIdNumber, dob, residentialAddress };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    // upload files to cloudinary
    const validationPromises = Object.keys(req.files).map(async (key) => {
      const file = req.files[key][0];
      console.log(req.files[key][0].mimetype);
      const { error, value } = fileSchema.validate(file);

      if (error) {
        return res.status(400).send({
          success: false,
          message: error.details[0].message,
        });
      }

      // Wrap the Cloudinary upload in a promise
      return new Promise((resolve, reject) => {
        console.log("Promise started");
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto", // or 'image', 'video', 'raw'
              public_id: `errango/kyc/${file.originalname}`, // Set your desired folder and file name
            },
            (error, result) => {
              if (error) {
                console.log("Cloudinary upload error");
                reject("Cloudinary upload error");
              } else {
                console.log("Cloudinary upload success");
                resolve({
                  fieldname: file.fieldname,
                  url: result.url,
                });
              }
            }
          )
          .end(file.buffer);
      });
    });

    // Wait for all promises to resolve
    const imageUrls = await Promise.all(validationPromises);

    let docFileUrl;
    let faceImageUrl;

    for (const image of imageUrls) {
      if (image.fieldname === "docFile") {
        docFileUrl = image.url;
      }

      if (image.fieldname === "faceImage") {
        faceImageUrl = image.url;
      }
    }

    const kyc = await KYC.create({
      userId: req.userId,
      docType,
      docFile: docFileUrl,
      docIdNumber,
      dob,
      residentialAddress,
      faceImage: faceImageUrl,
    });

    return res.json({
      success: true,
      message: "KYC created successfully",
      data: kyc,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.approve_user_kyc = async (req, res) => {
  const { userId } = req.params;
  console.log("here");
  try {
    const kyc = await KYC.findOne().where("userId").equals(userId);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    kyc.isVerified = true;
    await kyc.save();

    return res.json({
      success: true,
      message: "KYC verified successfully",
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

module.exports.decline_user_kyc = async (req, res) => {
  const { userId } = req.params;
  try {
    const kyc = await KYC.findOne().where("userId").equals(userId);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    kyc.isVerified = false;
    await kyc.save();

    // send notification for this

    return res.json({
      success: true,
      message: "KYC declined successfully",
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
