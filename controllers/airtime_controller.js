const axios = require("axios");
const logger = require("../utils/logger");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const WalletHistory = require("../models/WalletHistory");
const Notification = require("../models/Notification");
const AirtimeBeneficiary = require("../models/AirtimeBeneficiary");
const bcrypt = require("bcrypt");

module.exports.get_airtime_billers = async (req, res) => {
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

    const namesToMatch = [
      "MTN_NIGERIA",
      "AIRTEL_NIGERIA",
      "GLO_NIGERIA",
      "9MOBILE_NIGERIA",
    ];

    const filteredList = response.data.responseData.filter((biller) =>
      namesToMatch.includes(biller.slug)
    );

    return res.json({
      status: true,
      data: filteredList,
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

module.exports.get_airtime_packages = async (req, res) => {
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
      data: response.data.responseData[0],
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

module.exports.send_airtime = async (req, res) => {
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
      type: "AIRTIME",
      amount: amount,
      status: "SUCCESS",
      reference: reference,
    });

    await Notification.create({
      user: req.userId,
      type: "AIRTIME",
      title: "Airtime Purchase",
      description: `You have successfully purchased airtime worth ${amount} for ${customerId}`,
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

module.exports.add_beneficiary = async (req, res) => {
  const { number, type, name } = req.body;

  try {
    const user = await User.findOne().where("_id").equals(req.userId);

    const exists = await AirtimeBeneficiary.findOne()
      .where("number")
      .equals(number);

    if (exists) {
      return res.json({
        status: true,
        data: exists,
      });
    }

    const beneficiary = await AirtimeBeneficiary.create({
      user: user._id,
      number: number,
      type: type,
      name: name,
    });

    return res.json({
      status: true,
      data: beneficiary,
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

module.exports.get_beneficiaries = async (req, res) => {
  try {
    const beneficiaries = await AirtimeBeneficiary.find()
      .where("user")
      .equals(req.userId);

    return res.json({
      status: true,
      data: beneficiaries,
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

module.exports.delete_beneficiary = async (req, res) => {
  const { beneficiaryId } = req.params;

  try {
    await AirtimeBeneficiary.deleteOne({ beneficiaryId });

    return res.json({
      status: true,
      data: "beneficiary deleted!",
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
