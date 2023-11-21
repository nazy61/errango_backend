"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AppInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }
  AppInfo.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      supportEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "AppInfo must have a support email" },
          notEmpty: { msg: "Support email must not be empty" },
        },
      },
      supportPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "AppInfo must have a support phone" },
          notEmpty: { msg: "Support Phone must not be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "app_info",
      modelName: "AppInfo",
    }
  );
  return AppInfo;
};
