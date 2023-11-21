"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ErrandTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Errand }) {
      // define association here
      this.belongsTo(Errand, { foreignKey: "errandId", as: "errand" });
    }
  }
  ErrandTransaction.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      errandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Transaction must have an errand" },
          isInt: { msg: "Errand must be an integer" },
        },
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Transaction must have a type" },
          notEmpty: { msg: "Type must not be empty" },
        },
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Transaction must have a reference" },
          notEmpty: { msg: "Reference must not be empty" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notNull: { msg: "Errand Transaction must have a description" },
          notEmpty: { msg: "Description must not be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "errand_transactions",
      modelName: "ErrandTransaction",
    }
  );
  return ErrandTransaction;
};
