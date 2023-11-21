"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KYC extends Model {
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
  KYC.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "KYC must have a userId" },
          isInt: { msg: "userId must be an integer" },
        },
      },
      docType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "KYC must have a doc type" },
          notEmpty: { msg: "doc type must not be empty" },
        },
      },
      docFile: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "KYC must have a doc file" },
          notEmpty: { msg: "doc file must not be empty" },
        },
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          notNull: { msg: "KYC must have a date of birth" },
          notEmpty: { msg: "date of birth must not be empty" },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "KYC must have an address" },
          notEmpty: { msg: "Address must not be empty" },
        },
      },
      faceImage: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "KYC must have a face image" },
          notEmpty: { msg: "Face image must not be empty" },
        },
      },
      docIDNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "KYC must have a document ID Number" },
          notEmpty: { msg: "document ID Number must not be empty" },
        },
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "kycs",
      modelName: "KYC",
    }
  );
  return KYC;
};
