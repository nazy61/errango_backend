"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ErrandChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, ErrandMessage }) {
      // define association here
      this.belongsTo(User, { foreignKey: "posterUserId", as: "poster" });
      this.belongsTo(User, { foreignKey: "runnerUserId", as: "runner" });
      this.hasMany(ErrandMessage, {
        foreignKey: "errandChatId",
        as: "messages",
      });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        posterUserId: undefined,
        runnerUserId: undefined,
      };
    }
  }
  ErrandChat.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      posterUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Chat must have a poster" },
          isInt: { msg: "Poster must be an integer" },
        },
      },
      runnerUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Chat must have a runner" },
          isInt: { msg: "Runner must be an integer" },
        },
      },
    },
    {
      sequelize,
      tableName: "errand_chats",
      modelName: "ErrandChat",
    }
  );
  return ErrandChat;
};
