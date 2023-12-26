const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    docType: {
      type: String,
      required: true,
    },
    docFile: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    residentialAddress: {
      type: String,
      required: true,
    },
    faceImage: {
      type: String,
      required: true,
    },
    docIdNumber: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KYC", kycSchema);
