"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PostedErrands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Errand }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId", as: "poster" });
      this.belongsTo(User, { foreignKey: "acceptedUserId", as: "runner" });
      this.belongsTo(Errand, { foreignKey: "errandId", as: "errand" });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        errandId: undefined,
        userId: undefined,
        acceptedUserId: undefined,
      };
    }
  }
  PostedErrands.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      errandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Posted Errands must have a errand id" },
          isInt: { msg: "Errand id must be an integer" },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Posted Errands must have a poster" },
          isInt: { msg: "Poster must be an integer" },
        },
      },
      acceptedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Posted Errands must have a runner" },
          isInt: { msg: "Runner must be an integer" },
        },
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      totalAmount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "posted_errands",
      modelName: "PostedErrands",
    }
  );
  return PostedErrands;
};
