"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AcceptedErrands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Errand }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId", as: "accepter" });
      this.belongsTo(Errand, { foreignKey: "errandId", as: "errand" });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        errandId: undefined,
        userId: undefined,
      };
    }
  }
  AcceptedErrands.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      errandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Accepted Errands must have a errand id" },
          isInt: { msg: "Errand id must be an integer" },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Accepted Errands must have an accepter" },
          isInt: { msg: "User id must be an integer" },
        },
      },
    },
    {
      sequelize,
      tableName: "accepted_errands",
      modelName: "AcceptedErrands",
    }
  );
  return AcceptedErrands;
};
