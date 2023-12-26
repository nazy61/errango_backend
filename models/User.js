const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.keyValue.hasOwnProperty("email")) {
      next(
        new Error(
          "email all ready registered, please create an account with another email address"
        )
      );
    } else if (error.keyValue.hasOwnProperty("phoneNumber")) {
      next(
        new Error(
          "phone number all ready registered, please login with this phone number"
        )
      );
    }
    next("Unknown error, please contact the administrator");
  } else {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
