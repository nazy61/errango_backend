const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    faqCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FAQCategory",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FAQ", faqSchema);
