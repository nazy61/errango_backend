"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("transactions", {
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
      errandTypeId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      sender: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      receiver: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      amount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      balanceBefore: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      balanceAfter: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      isConfirmed: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      reference: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      completedAt: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      bankName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: true,
        type: DataTypes.STRING,
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
    await queryInterface.dropTable("transactions");
  },
};
