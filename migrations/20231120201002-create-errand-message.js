"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("errand_messages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      senderId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      receiverId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      errandChatId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      message: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      messageType: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      file: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("errand_messages");
  },
};
