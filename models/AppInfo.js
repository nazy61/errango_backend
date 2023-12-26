const mongoose = require("mongoose");

const appInfoSchema = new mongoose.Schema(
  {
    supportEmail: {
      type: String,
      required: true,
    },
    supportPhone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AppInfo", appInfoSchema);
