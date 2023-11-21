"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ErrandReview extends Model {
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
  ErrandReview.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Review must have a reviewer" },
          isInt: { msg: "Reviewer must be an integer" },
        },
      },
      errandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Errand Review must have a errand" },
          isInt: { msg: "Errand id must be an integer" },
        },
      },
      rating: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "errand_reviews",
      modelName: "ErrandReview",
    }
  );
  return ErrandReview;
};
