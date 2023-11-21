"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ TypeOfErrand }) {
      // define association here
      this.belongsTo(TypeOfErrand, {
        foreignKey: "errandTypeId",
        as: "errandType",
      });
    }

    toJSON() {
      return { ...this.get(), id: undefined, errandTypeId: undefined };
    }
  }
  Transaction.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      errandTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Transaction must have an errand type" },
          isInt: { msg: "Errand type must be an integer" },
        },
      },
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Transaction must have a sender" },
          notEmpty: { msg: "Sender must not be empty" },
        },
      },
      receiver: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Transaction must have a receiver" },
          notEmpty: { msg: "Receiver must not be empty" },
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Transaction must have a type" },
          notEmpty: { msg: "Type must not be empty" },
        },
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      balanceBefore: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      balanceAfter: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      isConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Transaction must have a reference" },
          notEmpty: { msg: "Reference must not be empty" },
        },
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Transaction must have a bank name" },
          notEmpty: { msg: "Bank name must not be empty" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notNull: { msg: "Transaction must have a description" },
          notEmpty: { msg: "Description must not be empty" },
        },
      },
      completedAt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "transactions",
      modelName: "Transaction",
    }
  );
  return Transaction;
};
