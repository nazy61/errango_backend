"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FAQCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ FAQ }) {
      // define association here
      this.hasMany(FAQ, { foreignKey: "faqCategoryId", as: "faqs" });
    }

    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }
  FAQCategory.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "FAQ Category must have a name" },
          notEmpty: { msg: "Name must not be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "faq_categories",
      modelName: "FAQCategory",
    }
  );
  return FAQCategory;
};
