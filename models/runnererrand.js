"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RunnerErrand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Errand }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId", as: "user" });
      this.belongsTo(Errand, { foreignKey: "errandId", as: "errand" });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        userId: undefined,
        errandId: undefined,
      };
    }
  }
  RunnerErrand.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Runner Errands must have a user id" },
          isInt: { msg: "User id must be an integer" },
        },
      },
      errandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Runner Errands must have a errand id" },
          isInt: { msg: "Errand id must be an integer" },
        },
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "runner_errands",
      modelName: "RunnerErrand",
    }
  );
  return RunnerErrand;
};
