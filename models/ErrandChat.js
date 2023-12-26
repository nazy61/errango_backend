const mongoose = require("mongoose");

const errandChatSchema = new mongoose.Schema(
  {
    posterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    runnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ErrandChat", errandChatSchema);
