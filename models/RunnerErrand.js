const mongoose = require("mongoose");

const runnerErrandSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    errand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("RunnerErrand", runnerErrandSchema);
