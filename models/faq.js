"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FAQ extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ FAQCategory }) {
      // define association here
      this.hasMany(FAQCategory, {
        foreignKey: "faqCategoryId",
        as: "faq_category",
      });
    }

    toJSON() {
      return { ...this.get(), id: undefined, faqCategoryId: undefined };
    }
  }
  FAQ.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      faqCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "FAQ must have a FAQ category" },
          isInt: { msg: "FAQ must be an integer" },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "FAQ must have a title" },
          notEmpty: { msg: "Title must not be empty" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "FAQ must have a description" },
          notEmpty: { msg: "Description must not be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "faqs",
      modelName: "FAQ",
    }
  );
  return FAQ;
};
