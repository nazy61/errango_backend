const mongoose = require("mongoose");

const errandChatSchema = new mongoose.Schema(
  {
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    runner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    errand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ErrandChat", errandChatSchema);
