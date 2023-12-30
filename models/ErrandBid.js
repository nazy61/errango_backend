const mongoose = require("mongoose");

const errandBidSchema = new mongoose.Schema(
  {
    errand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ErrandBid", errandBidSchema);
