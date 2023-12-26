const mongoose = require("mongoose");

const errandSchema = new mongoose.Schema(
  {
    typeOfErrandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeOfErrand",
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
