const mongoose = require("mongoose");

const transactionReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    transactionReference: {
      type: String,
      required: true,
    },
    moreInformation: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TransactionReport", transactionReportSchema);
