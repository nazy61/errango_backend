"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
require("dotenv").config();

const bcryptSalt = process.env.BCRYPT_SALT || 10;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Role,
      Verification,
      KYC,
      ErrandChat,
      PostedErrands,
      AcceptedErrands,
      ErrandMessage,
      ErrandReview,
      RunnerErrand,
    }) {
      // define association here
      this.belongsTo(Role, { foreignKey: "roleId", as: "role" });
      this.hasMany(Verification, { foreignKey: "userId", as: "verifications" });
      this.hasMany(ErrandReview, { foreignKey: "userId", as: "reviews" });
      this.hasMany(RunnerErrand, { foreignKey: "userId", as: "runnerErrands" });
      this.hasMany(ErrandMessage, { foreignKey: "senderId", as: "messages" });
      this.hasMany(ErrandMessage, { foreignKey: "receiverId", as: "messages" });
      this.hasOne(KYC, { foreignKey: "userId", as: "kyc" });
      this.hasMany(ErrandChat, {
        foreignKey: "posterUserId",
        as: "errandChats",
      });
      this.hasMany(ErrandChat, {
        foreignKey: "runnerUserId",
        as: "errandChats",
      });
      this.hasMany(PostedErrands, {
        foreignKey: "userId",
        as: "postedErrands",
      });
      this.hasMany(AcceptedErrands, {
        foreignKey: "userId",
        as: "acceptedErrands",
      });
    }

    toJSON() {
      return { ...this.get(), id: undefined, roleId: undefined };
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a role" },
          isInt: { msg: "role must be an integer" },
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a first name" },
          notEmpty: { msg: "First name must not be empty" },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a last name" },
          notEmpty: { msg: "Last name must not be empty" },
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a full name" },
          notEmpty: { msg: "Full name must not be empty" },
        },
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a username" },
          notEmpty: { msg: "Username must not be empty" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: "User must have an email address" },
          notEmpty: { msg: "Email address must not be empty" },
          isEmail: { msg: "Must be a valid email address" },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a full name" },
          notEmpty: { msg: "Full name must not be empty" },
          is: {
            args: /^(\+234)[789]\d{9}$/,
            msg: "Phone number must be a Nigerian number",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a password" },
          notEmpty: { msg: "Password must not be empty" },
          is: {
            args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            msg: "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character.",
          },
        },
      },
      pin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a pin" },
          notEmpty: { msg: "Pin must not be empty" },
        },
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );

  // Before creating a user, hash the password
  User.afterValidate("afterValidation", async (user, options) => {
    const hashedPassword = await bcrypt.hash(user.password, bcryptSalt);
    const hashedPin = await bcrypt.hash(user.pin, bcryptSalt);
    user.password = hashedPassword;
    user.pin = hashedPin;
  });

  return User;
};
