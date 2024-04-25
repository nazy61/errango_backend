const axios = require("axios");
const logger = require("../utils/logger");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const WalletHistory = require("../models/WalletHistory");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");

module.exports.get_mobile_data_billers = async (req, res) => {
  try {
    const encoded = Buffer.from(
      process.env.CORALPAY_USERNAME + ":" + process.env.CORALPAY_PASSWORD
    ).toString("base64");

    const headers = {
      Authorization: "Basic " + encoded,
    };

    const response = await axios.get(
      `${process.env.CORALPAY_BASE_URL}billers/group/slug/AIRTIME_AND_DATA`,
      { headers }
    );

    return res.json({
      status: true,
      data: response.data.responseData,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.get_mobile_data_packages = async (req, res) => {
  const { type } = req.params;

  try {
    const encoded = Buffer.from(
      process.env.CORALPAY_USERNAME + ":" + process.env.CORALPAY_PASSWORD
    ).toString("base64");

    const headers = {
      Authorization: "Basic " + encoded,
    };

    const response = await axios.get(
      `${process.env.CORALPAY_BASE_URL}packages/biller/slug/${type}`,
      { headers }
    );

    return res.json({
      status: true,
      data: response.data.responseData.slice(1, -1),
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.send_mobile_data = async (req, res) => {
  const { customerId, billerSlug, amount, pin } = req.body;

  try {
    const user = await User.findOne().where("_id").equals(req.userId);
    const wallet = await Wallet.findOne().where("user").equals(req.userId);
    const auth = await bcrypt.compare(pin, user.pin);

    if (!auth) {
      return res.status(400).json({
        status: false,
        message: "Invalid pin",
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        status: false,
        message: "Insufficient balance",
      });
    }

    const encoded = Buffer.from(
      process.env.CORALPAY_USERNAME + ":" + process.env.CORALPAY_PASSWORD
    ).toString("base64");

    const headers = {
      Authorization: "Basic " + encoded,
    };

    const reference = Math.floor(Math.random() * 1000000000);

    const response = await axios.post(
      `${process.env.CORALPAY_BASE_URL}transactions/process-payment`,
      {
        paymentReference: reference,
        customerId: customerId,
        packageSlug: billerSlug,
        channel: "MOBILE",
        amount: amount,
        customerName: user.fullName,
        phoneNumber: user.phone,
        email: user.email,
        accountNumber: "0012345678",
      },
      { headers }
    );

    const newBalance = wallet.balance - amount;

    await WalletHistory.create({
      wallet: wallet._id,
      type: "DEBIT",
      amount: amount,
      reference: reference,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance,
    });

    wallet.balance = newBalance;
    await wallet.save();

    const transaction = await Transaction.create({
      user: req.userId,
      type: "MOBILE_DATA",
      amount: amount,
      status: "SUCCESS",
      reference: reference,
    });

    await Notification.create({
      user: req.userId,
      type: "MOBILE_DATA",
      title: "Mobile Data Purchase",
      description: `You have successfully purchased mobile data worth ${amount}`,
    });

    return res.json({
      coral_response: response.data,
      transaction: transaction,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};
