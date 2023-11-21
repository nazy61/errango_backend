"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("verifications", {
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
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      otp: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isVerified: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      isPhoneVerification: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      isEmailVerification: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
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
    await queryInterface.dropTable("verifications");
  },
};
