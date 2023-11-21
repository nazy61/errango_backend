"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ErrandMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, ErrandChat }) {
      // define association here
      this.belongsTo(User, { foreignKey: "senderId", as: "sender" });
      this.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });
      this.belongsTo(ErrandChat, {
        foreignKey: "errandChatId",
        as: "errandChat",
      });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        senderId: undefined,
        receiverId: undefined,
        errandChatId: undefined,
      };
    }
  }
  ErrandMessage.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Message must have a sender id" },
          isInt: { msg: "Sender id must be an integer" },
        },
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Message must have a receiver id" },
          isInt: { msg: "Receiver id must be an integer" },
        },
      },
      errandChatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Message must have a errand chat id" },
          isInt: { msg: "Errand Chat id must be an integer" },
        },
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      messageType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Message must have a message type" },
          notEmpty: { msg: "Message type must not be empty" },
        },
      },
      file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "errand_messages",
      modelName: "ErrandMessage",
    }
  );
  return ErrandMessage;
};
