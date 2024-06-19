const axios = require("axios");
const logger = require("../utils/logger");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletHistory = require("../models/WalletHistory");
const Transaction = require("../models/Transaction");

module.exports.initialize_payment = async (req, res) => {
  const { amount } = req.body;

  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    const headers = {
      Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY,
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: amount,
      },
      { headers }
    );

    return res.json(response.data);
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.verify_payment = async (req, res) => {
  const { reference } = req.body;

  try {
    const headers = {
      Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY,
    };

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers }
    );

    if (response.data.data.status === "success") {
      const wallet = await Wallet.findOne().where("user").equals(req.userId);
      wallet.balance += response.data.data.amount / 100;
      await wallet.save();

      await WalletHistory.create({
        wallet: wallet._id,
        amount: response.data.data.amount / 100,
        type: "CREDIT",
        reference: reference,
        balanceBefore: wallet.balance - response.data.data.amount / 100,
        balanceAfter: wallet.balance,
      });

      await Transaction.create({
        user: req.userId,
        type: "PAYSTACK_FUNDING",
        amount: response.data.data.amount / 100,
        status: "SUCCESS",
        reference: reference,
      });

      return res.json(response.data);
    } else {
      return res.status(400).json({
        status: false,
        message: "Transaction failed",
      });
    }
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};
