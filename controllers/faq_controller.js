const logger = require("../utils/logger");
const FAQ = require("../models/FAQ");
const FAQCategory = require("../models/FAQCategory");

module.exports.get_faqs = async (req, res) => {
  try {
    const faqs = await FAQ.find();

    return res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_faq_categories = async (req, res) => {
  try {
    const response = [];

    const faqCategories = await FAQCategory.find();

    for (const faqCategory of faqCategories) {
      const faqs = await FAQ.find()
        .where("faqCategoryId")
        .equals(faqCategory._id);

      response.push({
        name: faqCategory.name,
        faqs: faqs,
      });
    }

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.migrate_faq_categories = async (req, res) => {
  const general = { name: "General" };
  const transfer = { name: "Transfer" };
  const receive = { name: "Receive" };
  const fund = { name: "Fund" };

  try {
    await FAQCategory.create(general);
    await FAQCategory.create(transfer);
    await FAQCategory.create(receive);
    await FAQCategory.create(fund);

    const faqCategories = await FAQCategory.find();

    return res.json({
      success: true,
      data: faqCategories,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.migrate_faqs = async (req, res) => {
  const q1 = {
    faqCategoryId: "658ac1e452cd2f0bfb9971db",
    title: "What is the purpose of the errand booking application?",
    description:
      "The errand booking application is designed to connect individuals who need assistance with errands to reliable runners who can efficiently complete those tasks on their behalf.",
  };
  const q2 = {
    faqCategoryId: "658ac1e452cd2f0bfb9971db",
    title: "How does the errand booking process work?",
    description:
      "Users can post their errands on the platform, specifying details such as the task, location, and deadline. Runners can then browse available errands, accept ones they can complete, and proceed to fulfill them.",
  };
  const q3 = {
    faqCategoryId: "658ac1e452cd2f0bfb9971db",
    title: "What types of errands can be posted on the platform?",
    description:
      "The platform accommodates a wide range of errands, including grocery shopping, package deliveries, waiting in line, and more. Users can describe their specific needs when posting an errand.",
  };
  const q4 = {
    faqCategoryId: "658ac1e452cd2f0bfb9971db",
    title: "How are payments handled on the platform?",
    description:
      "Payments are securely processed within the application. Users pay for the service when posting an errand, and the funds are held in escrow until the runner successfully completes the task, ensuring a fair and trustworthy transaction.",
  };
  const q5 = {
    faqCategoryId: "658ac1e452cd2f0bfb9971db",
    title: "How are runners selected for a particular errand?",
    description:
      "Runners can view available errands and choose the ones that match their skills, location, and availability. Users also have the option to select specific runners based on their profiles and ratings.",
  };

  try {
    await FAQ.create(q1);
    await FAQ.create(q2);
    await FAQ.create(q3);
    await FAQ.create(q4);
    await FAQ.create(q5);

    const faqs = await FAQ.find();

    return res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
