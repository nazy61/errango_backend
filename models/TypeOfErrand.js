const mongoose = require("mongoose");

const typeOfErrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TypeOfErrand", typeOfErrandSchema);
