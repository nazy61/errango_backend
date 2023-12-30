const mongoose = require("mongoose");

const postedErrandSchema = new mongoose.Schema(
  {
    errand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    totalAmount: {
      type: Number,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PostedErrand", postedErrandSchema);
