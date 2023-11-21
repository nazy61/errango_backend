"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TypeOfErrand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Errand, Transaction }) {
      // define association here
      this.hasMany(Errand, { foreignKey: "typeOfErrandId", as: "errands" });
      this.hasMany(Transaction, {
        foreignKey: "errandTypeId",
        as: "transactions",
      });
    }

    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }
  TypeOfErrand.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Type of errand must have a name" },
          notEmpty: { msg: "name must not be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "type_of_errands",
      modelName: "TypeOfErrand",
    }
  );
  return TypeOfErrand;
};
