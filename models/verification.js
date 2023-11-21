"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
require("dotenv").config();

const bcryptSalt = process.env.BCRYPT_SALT || 10;

module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId", as: "user" });
    }

    toJSON() {
      return { ...this.get(), id: undefined, userId: undefined };
    }
  }
  Verification.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Verification must have a user" },
          isInt: { msg: "user must be an integer" },
        },
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Verification must have an otp" },
          notEmpty: { msg: "otp must not be empty" },
          len: {
            args: [6, 6], // Exactly 6 characters
            msg: "OTP incorrect.",
          },
        },
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isPhoneVerification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isEmailVerification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "verifications",
      modelName: "Verification",
    }
  );

  // Before creating, hash the otp
  Verification.afterValidate(
    "afterValidation",
    async (verification, options) => {
      const hashedOTP = await bcrypt.hash(verification.otp, bcryptSalt);
      verification.otp = hashedOTP;
    }
  );

  return Verification;
};
