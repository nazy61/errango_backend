const mongoose = require("mongoose");

const walletHistorySchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountCharged: {
      type: Number,
    },
    type: {
      type: String, // debit or credit
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WalletHistory", walletHistorySchema);
