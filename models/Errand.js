const mongoose = require("mongoose");

const errandSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    minimumBid: {
      type: Number,
      required: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Errand", errandSchema);
