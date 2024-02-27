const Joi = require("joi");
const logger = require("../utils/logger");
const Errand = require("../models/Errand");
const RunnerErrand = require("../models/RunnerErrand");
const PostedErrand = require("../models/PostedErrand");
const ErrandMessage = require("../models/ErrandMessage");
const ErrandBid = require("../models/ErrandBid");
const ErrandChat = require("../models/ErrandChat");
const ErrandReview = require("../models/ErrandReview");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const ErrandTransaction = require("../models/ErrandTransaction");

module.exports.get_my_errands = async (req, res) => {
  try {
    const errands = await PostedErrand.find({
      $and: [{ acceptedUser: req.userId }, { disabled: false }],
    })
      .populate("errand")
      .populate("user")
      .populate("acceptedUser");

    return res.json({
      success: true,
      data: errands,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_errands = async (req, res) => {
  try {
    const errands = await Errand.find().populate("user");

    return res.json({
      success: true,
      data: errands,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_my_requests = async (req, res) => {
  try {
    const errands = await PostedErrand.find({
      $and: [{ user: req.userId }, { disabled: false }],
    })
      .populate("errand")
      .populate("user")
      .populate("acceptedUser");

    return res.json({
      success: true,
      data: errands,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_errand = async (req, res) => {
  const { postedErrandId } = req.params;

  try {
    const errand = await PostedErrand.findOne()
      .where("_id")
      .equals(postedErrandId)
      .populate("errand")
      .populate("acceptedUser")
      .populate("user");
    console.log(errand);

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    return res.json({
      success: true,
      data: errand,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_errand_messages = async (req, res) => {
  const { errandId } = req.params;
  try {
    const errandChat = await ErrandChat.findOne()
      .where("errand")
      .equals(errandId);

    if (!errandChat) {
      return res.status(404).json({
        success: false,
        message: "Errand Chat not found",
      });
    }

    const messages = await ErrandMessage.find()
      .where("errandChat")
      .equals(errandChat._id);

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_errand_bids = async (req, res) => {
  const { errandId } = req.params;
  try {
    const bids = await ErrandBid.find()
      .where("errand")
      .equals(errandId)
      .populate("errand")
      .populate("bidder");

    return res.json({
      success: true,
      data: bids,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_errand_transactions = async (req, res) => {
  const { errandId } = req.params;
  try {
    const transactions = await ErrandTransaction.find({
      $and: [{ errand: errandId }, { type: "deposit" }],
    });

    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_runner_transactions = async (req, res) => {
  const { errandId } = req.params;
  try {
    const transactions = await ErrandTransaction.find({
      $and: [{ errand: errandId }, { type: "withdrawal" }],
    });

    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.request_errand = async (req, res) => {
  const {
    type,
    address,
    pickUpAddress,
    description,
    suggestedAmount,
    lat,
    lng,
  } = req.body;

  const schema = Joi.object().keys({
    type: Joi.string().required(),
    address: Joi.string().required(),
    pickUpAddress: Joi.string().allow(null),
    description: Joi.string().required(),
    suggestedAmount: Joi.number().allow(null),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  });

  const data = {
    type,
    address,
    pickUpAddress,
    description,
    suggestedAmount,
    lat,
    lng,
  };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const errand = await Errand.create({
      user: req.userId,
      type,
      address,
      pickUpAddress,
      description,
      lat,
      lng,
      amount: suggestedAmount,
    });

    const postedErrand = await PostedErrand.create({
      errand: errand._id,
      user: req.userId,
      suggestedAmount: suggestedAmount,
    });

    const newPostedErrand = await PostedErrand.findOne()
      .where("_id")
      .equals(postedErrand._id)
      .populate("errand")
      .populate("user");

    return res.json({
      success: true,
      message: "Errand request sent",
      data: newPostedErrand,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.bid_errand = async (req, res) => {
  const { errandId, amount } = req.body;

  const schema = Joi.object().keys({
    errandId: Joi.string().required(),
    amount: Joi.number().required(),
  });

  const data = { errandId, amount };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const errand = await Errand.findOne().where("_id").equals(errandId);

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    console.log("error");

    const bid = await ErrandBid.create({
      errand: errandId,
      bidder: req.userId,
      bidAmount: amount,
    });

    return res.json({
      success: true,
      message: "Errand bidded for successfully",
      data: errand,
    });
  } catch (error) {
    console.log(error);
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.auto_assign_errand_request = async (req, res) => {
  const { errandId } = req.body;

  const schema = Joi.object().keys({
    errandId: Joi.string().required(),
  });

  const data = { errandId };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const errand = await Errand.findOne().where("_id").equals(errandId);

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    errand.isAccepted = true;
    errand.save();

    const postedErrand = await PostedErrand.findOne()
      .where("errand")
      .equals(errandId);

    postedErrand.acceptedUser = req.userId;
    postedErrand.totalAmount = 0;

    await postedErrand.save();

    await RunnerErrand.create({
      user: req.userId,
      errand: errandId,
    });

    return res.json({
      success: true,
      message: "Errand accepted",
      data: {},
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.accept_errand_request = async (req, res) => {
  const { errandId, bidId } = req.body;

  const schema = Joi.object().keys({
    errandId: Joi.string().required(),
    bidId: Joi.string().required(),
  });

  const data = { errandId, bidId };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const errand = await Errand.findOne().where("_id").equals(errandId);
    const bid = await ErrandBid.findOne().where("_id").equals(bidId);

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    errand.isAccepted = true;
    errand.save();

    const postedErrand = await PostedErrand.findOne()
      .where("errand")
      .equals(errandId);

    postedErrand.acceptedUser = bid.bidder;
    postedErrand.totalAmount = bid.bidAmount;

    postedErrand.save();

    await RunnerErrand.create({
      user: bid.bidder,
      errand: errandId,
    });

    return res.json({
      success: true,
      message: "Errand accepted",
      data: {},
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.create_errand_chat = async (req, res) => {
  const { posterId, runnerId, errandId } = await req.body;

  const schema = Joi.object().keys({
    posterId: Joi.string().required(),
    runnerId: Joi.string().required(),
    errandId: Joi.string().required(),
  });

  const data = { posterId, runnerId, errandId };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const poster = await User.findOne().where("_id").equals(posterId);
    const runner = await User.findOne().where("_id").equals(runnerId);
    const errand = await Errand.findOne().where("_id").equals(errandId);

    if (!poster) {
      return res.status(404).json({
        success: false,
        message: "Poster not found",
      });
    }

    if (!runner) {
      return res.status(404).json({
        success: false,
        message: "Runner not found",
      });
    }

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    const chat = await ErrandChat.create({
      poster: posterId,
      runner: runnerId,
      errand: errandId,
    });

    return res.json({
      success: true,
      message: "Chat created",
      data: chat,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.send_errand_message = async (req, res) => {
  const { senderId, receiverId, chatId, message, messageType, file } =
    await req.body;

  const schema = Joi.object().keys({
    senderId: Joi.string().required(),
    receiverId: Joi.string().required(),
    chatId: Joi.string().required(),
    message: Joi.string().required(),
    messageType: Joi.string().required(),
  });

  const data = { senderId, receiverId, chatId, message, messageType };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const sender = await User.findOne().where("_id").equals(senderId);
    const receiver = await User.findOne().where("_id").equals(receiverId);
    const chat = await ErrandChat.findOne().where("_id").equals(chatId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messageResponse = await ErrandMessage.create({
      errandChat: chatId,
      sender: senderId,
      receiver: receiverId,
      message,
      messageType,
    });

    return res.json({
      success: true,
      message: "Message sent successfully",
      data: messageResponse,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.end_errand_session = async (req, res) => {
  const { errandId } = req.params;

  try {
    const errand = await Errand.findOne().where("_id").equals(errandId);

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    const postedErrand = await PostedErrand.findOne()
      .where("errand")
      .equals(errandId);

    postedErrand.isCompleted = true;
    await postedErrand.save();

    const runnerErrand = await RunnerErrand.findOne()
      .where("_id")
      .equals(errandId);

    if (runnerErrand) {
      runnerErrand.isCompleted = true;
      await runnerErrand.save();

      const runnerWallet = await Wallet.findOne()
        .where("user")
        .equals(postedErrand.acceptedUser);

      const errangoWallet = await Wallet.findOne()
        .where("user")
        .equals(postedErrand.user);

      errangoWallet.balance += runnerWallet.balance;
      runnerWallet.balance = 0;
      await runnerWallet.save();
      await errangoWallet.save();
    }

    postedErrand.isCompleted = true;
    await postedErrand.save();

    return res.json({
      success: true,
      message: "Errand completed successfully",
      data: {},
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.review_errand = async (req, res) => {
  const { errandId, rating, comment, tip } = req.body;

  const schema = Joi.object().keys({
    errandId: Joi.string().required(),
    rating: Joi.number().required(),
    comment: Joi.string().required(),
    tip: Joi.number().required(),
  });

  const data = { errandId, rating, comment, tip };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const errand = await Errand.findOne().where("_id").equals(errandId);

    if (!errand) {
      return res.status(404).json({
        success: false,
        message: "Errand not found",
      });
    }

    const review = await ErrandReview.create({
      errand: errandId,
      user: req.userId,
      rating: rating,
      comment: comment,
      tip: tip,
    });

    return res.json({
      success: true,
      message: "Errand review done successfully",
      data: {},
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.fund_errand = async (req, res) => {
  const { errandId, amount } = req.body;

  const schema = Joi.object().keys({
    errandId: Joi.string().required(),
    amount: Joi.number().required(),
  });

  const data = { errandId, amount };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const postedErrand = PostedErrand.findOne()
      .where("errand")
      .equals(errandId);

    const wallet = Wallet.findOne()
      .where("user")
      .equals(postedErrand.acceptedUser);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Runner Wallet not found",
      });
    }

    const userWallet = await Wallet.findOne().where("user").equals(req.userId);

    if (amount <= userWallet.balance) {
      userWallet.balance -= amount;
      userWallet.save();

      wallet.balance += balance;
      await wallet.save();

      await ErrandTransaction.create({
        errandId: wallet.errand,
        amount: amount,
        type: "deposit",
        reference: generateUniqueReference(),
        description: "Deposit from user errango wallet",
      });

      return res.json({
        success: true,
        message: "Runner wallet funded successfully",
        data: wallet,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.check_active_errand = async (req, res) => {
  try {
    const postedErrand = await PostedErrand.findOne({
      acceptedUser: { $ne: null },
      $and: [{ isCompleted: false }],
      $or: [{ user: req.userId }, { acceptedUser: req.userId }],
    })
      .populate("errand")
      .populate("user")
      .populate("acceptedUser");

    console.log(postedErrand);

    const chatId = await ErrandChat.findOne()
      .where("errand")
      .equals(postedErrand.errand._id);

    return res.json({
      success: true,
      data: postedErrand,
      chatId: chatId,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.delete_my_request = async (req, res) => {
  const { errandId } = req.params;
  try {
    const errand = await PostedErrand.findOne({
      $and: [{ errand: errandId }, { user: req.userId }],
    });

    errand.disabled = true;
    errand.save();

    return res.json({
      success: true,
      message: "Request deleted!",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.delete_my_errand = async (req, res) => {
  const { errandId } = req.params;
  try {
    const errand = await RunnerErrand.findOne({
      $and: [{ errand: errandId }, { user: req.userId }],
    });

    errand.disabled = true;
    errand.save();

    return res.json({
      success: true,
      message: "Errand deleted!",
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

function generateUniqueReference() {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000000); // Adjust the range based on your needs

  const uniqueReference = `${timestamp}-${randomNum}`;
  return uniqueReference;
}
