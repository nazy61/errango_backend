"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Errand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      TypeOfErrand,
      PostedErrands,
      AcceptedErrands,
      ErrandReview,
      RunnerErrand,
      ErrandTransaction,
    }) {
      // define association here
      this.belongsTo(TypeOfErrand, {
        foreignKey: "typeOfErrandId",
        as: "typeOfErrand",
      });
      this.hasOne(PostedErrands, {
        foreignKey: "errandId",
        as: "postedErrand",
      });
      this.hasOne(AcceptedErrands, {
        foreignKey: "errandId",
        as: "acceptedErrand",
      });
      this.hasMany(ErrandTransaction, {
        foreignKey: "errandId",
        as: "transactions",
      });
      this.hasMany(ErrandReview, { foreignKey: "errandId", as: "reviews" });
      this.hasMany(RunnerErrand, {
        foreignKey: "errandId",
        as: "runnerErrands",
      });
    }

    toJSON() {
      return { ...this.get(), id: undefined, typeOfErrandId: undefined };
    }
  }
  Errand.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      typeOfErrandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand must have a type errand id" },
          isInt: { msg: "Type errand id must be an integer" },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand must have a address" },
          notEmpty: { msg: "address must not be empty" },
        },
      },
      pickupAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand must have a pickup address" },
          notEmpty: { msg: "pickup address must not be empty" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand must have a description" },
          notEmpty: { msg: "description must not be empty" },
        },
      },
      isAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "errands",
      modelName: "Errand",
    }
  );
  return Errand;
};
