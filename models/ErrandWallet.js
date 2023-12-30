const mongoose = require("mongoose");

const errandWalletSchema = new mongoose.Schema(
  {
    errand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ErrandWallet", errandWalletSchema);
