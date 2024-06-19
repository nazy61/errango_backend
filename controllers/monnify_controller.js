const axios = require("axios");
const logger = require("../utils/logger");
const BankBeneficiary = require("../models/BankBeneficiary");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const TransactionReport = require("../models/TransactionReport");
const Wallet = require("../models/Wallet");
const WalletHistory = require("../models/WalletHistory");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");

const authenticate = async () => {
  try {
    const headers = {
      Authorization:
        "Basic TUtfVEVTVF9INkoxVTNWUkhSOlVaQUdWUzgwWUUzTVhOOEY4OUZYVkczVzlERUJSR01U",
    };

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL}auth/login`,
      {},
      { headers }
    );

    return response.data.responseBody.accessToken;
  } catch (err) {
    console.log(err);
    logger.error(err);
    return null;
  }
};

module.exports.get_banks = async (req, res) => {
  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const response = await axios.get(`${process.env.MONNIFY_BASE_URL}banks`, {
      headers,
    });

    return res.json({
      status: true,
      data: response.data.responseBody,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.validate_account_number = async (req, res) => {
  const { accountNumber, bankCode } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const response = await axios.get(
      `${process.env.MONNIFY_BASE_URL}disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`,
      {
        headers,
      }
    );

    return res.json({
      status: true,
      data: response.data.responseBody,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.add_beneficiary = async (req, res) => {
  const { accountNumber, bankCode, accountName, bankName } = req.body;

  try {
    let bank = await BankBeneficiary.findOne({
      $and: [
        { user: req.userId },
        { accountNumber: accountNumber },
        { bankSortCode: bankCode },
      ],
    });

    if (bank) {
      return res.status(400).json({
        status: false,
        message: "Bank already exists",
      });
    }

    bank = await BankBeneficiary.create({
      user: req.userId,
      accountNumber,
      bankName,
      bankSortCode: bankCode,
      name: accountName,
    });

    return res.json({
      status: true,
      message: "Beneficiary Added",
      data: bank,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.get_beneficiaries = async (req, res) => {
  try {
    let beneficiaries = await BankBeneficiary.find()
      .where("user")
      .equals(req.userId);

    return res.json({
      status: true,
      data: beneficiaries,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.initiate_bank_tranfer = async (req, res) => {
  const {
    amount,
    description,
    bankSortCode,
    accountNumber,
    accountName,
    saveBeneficiary,
    pin,
  } = req.body;

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

    // if (wallet.balance < amount) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Insufficient balance",
    //   });
    // }

    const accessToken = await authenticate();

    console.log("here");

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const reference = Math.floor(Math.random() * 1000000000);

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL_v2}disbursements/single`,
      {
        amount: amount,
        reference: reference,
        narration: description,
        destinationBankCode: bankSortCode,
        destinationAccountNumber: accountNumber,
        currency: "NGN",
        sourceAccountNumber: user.accountNumber,
      },
      {
        headers,
      }
    );

    if (saveBeneficiary) {
      let bank = await BankBeneficiary.findOne({
        $and: [
          { user: req.userId },
          { accountNumber: accountNumber },
          { bankSortCode: bankSortCode },
        ],
      });

      if (!bank) {
        bank = BankBeneficiary.create({
          user: req.userId,
          accountNumber,
          bankName: response.data.responseBody.destinationBankName,
          bankSortCode: bankSortCode,
          name: accountName,
        });
      }
    }

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
      type: "TRANSFER",
      amount: amount,
      status: "PENDING",
      reference: reference,
      accountNumber: accountNumber,
      accountName: accountName,
      bankName: response.data.responseBody.destinationBankName,
      description: description,
      monnifyResponse: JSON.stringify(response.data.responseBody),
    });

    const monnifyResponse = response.data.responseBody;

    await Notification.create({
      user: req.userId,
      type: "TRANSFER",
      title: "Transfer from wallet",
      description: `You have successfully transferred ${amount} to ${response.data.responseBody.destinationAccountName}, ${response.data.responseBody.destinationAccountNumber}, ${response.data.responseBody.destinationBankName}`,
    });

    return res.json({
      status: true,
      data: { ...transaction._doc, monnifyResponse },
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err.data ?? err,
    });
  }
};

module.exports.complete_bank_tranfer = async (req, res) => {
  const { reference, authorizationCode } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL_v2}disbursements/single/validate-otp`,
      {
        reference,
        authorizationCode,
      },
      {
        headers,
      }
    );

    const transaction = await Transaction.findOne()
      .where("reference")
      .equals(reference);

    transaction.status = "SUCCESS";
    transaction.monnifyResponse = JSON.stringify(response.data.responseBody);
    await transaction.save();

    return res.json({
      status: true,
      data: { ...transaction, monnifyResponse: response.data.responseBody },
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err.data ?? err,
    });
  }
};

module.exports.get_transfer_history = async (req, res) => {
  try {
    let transfers = await Transaction.find({
      $and: [{ user: req.userId }, { type: "TRANSFER" }],
    });

    return res.json({
      status: true,
      data: transfers,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.get_transfer_history_between_two_users = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    let transfers = await Transaction.find({
      $and: [
        { user: req.userId },
        { type: "TRANSFER" },
        { accountNumber: accountNumber },
      ],
    });

    return res.json({
      status: true,
      data: transfers,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

module.exports.initialize_credit = async (req, res) => {
  const { amount, name, email } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const reference = Math.floor(Math.random() * 1000000000);

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL}merchant/transactions/init-transaction`,
      {
        amount: amount,
        customerName: name,
        customerEmail: email,
        paymentReference: reference,
        paymentDescription: "Credit Transaction",
        currencyCode: "NGN",
        contractCode: "8313207494",
        redirectUrl: "https://errango.com/transaction/confirm",
        paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      },
      {
        headers,
      }
    );

    return res.json({
      status: true,
      data: response.data.responseBody,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err.data ?? err,
    });
  }
};

module.exports.pay_with_bank_transfer = async (req, res) => {
  const { transactionReference } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL}merchant/bank-transfer/init-payment`,
      {
        transactionReference: transactionReference,
        bankCode: "035", // WEMA BANK
      },
      {
        headers,
      }
    );

    return res.json({
      status: true,
      data: response.data.responseBody,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err.data ?? err,
    });
  }
};

module.exports.charge_card = async (req, res) => {
  const {
    transactionReference,
    cardNumber,
    expiryMonth,
    expiryYear,
    pin,
    cvv,
  } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL}merchant/cards/charge`,
      {
        transactionReference: transactionReference,
        collectionChannel: "API_NOTIFICATION",
        card: {
          number: cardNumber,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          pin: pin,
          cvv: cvv,
        },
      },
      {
        headers,
      }
    );

    return res.json({
      status: true,
      data: response.data.responseBody,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      // message: err.data ?? err,
      message: "Invalid card details",
    });
  }
};

module.exports.charge_card_otp = async (req, res) => {
  const { transactionReference, token, tokenId } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL}merchant/cards/charge`,
      {
        transactionReference: transactionReference,
        collectionChannel: "API_NOTIFICATION",
        tokenId: tokenId,
        token: token,
      },
      {
        headers,
      }
    );

    return res.json({
      status: true,
      data: response.data.responseBody,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err.data ?? err,
    });
  }
};

module.exports.verify_transaction = async (req, res) => {
  const { transactionReference } = req.body;

  try {
    const accessToken = await authenticate();

    const headers = {
      Authorization: "bearer " + accessToken,
    };

    console.log(convert_string(transactionReference));

    const response = await axios.get(
      `${process.env.MONNIFY_BASE_URL_v2}transactions/${convert_string(
        transactionReference
      )}`,
      {
        headers,
      }
    );

    if (response.data.responseBody.paymentStatus === "PAID") {
      const wallet = await Wallet.findOne().where("user").equals(req.userId);
      wallet.balance += parseFloat(response.data.responseBody.settlementAmount);
      await wallet.save();

      await WalletHistory.create({
        wallet: wallet._id,
        type: "CREDIT",
        amount: response.data.responseBody.settlementAmount,
        reference: transactionReference,
        balanceBefore:
          wallet.balance - response.data.responseBody.settlementAmount,
        balanceAfter: wallet.balance,
      });

      await Notification.create({
        user: req.userId,
        type: "CREDIT",
        title: "Credit Transaction",
        description: `You have successfully credited your wallet with ${response.data.responseBody.settlementAmount}`,
      });

      return res.json({
        status: true,
        message: "Transaction verified",
        data: response.data.responseBody,
      });
    }

    return res.json({
      status: false,
      message: "Transaction verification failed",
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err.data ?? err,
    });
  }
};

module.exports.report_transaction = async (req, res) => {
  const { type, reference, moreInformation } = req.body;

  try {
    const report = await TransactionReport.create({
      user: req.userId,
      type,
      transactionReference: reference,
      moreInformation,
    });

    return res.json({
      status: true,
      message: "Transaction reported",
      data: report,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      status: false,
      message: err,
    });
  }
};

function convert_string(input_string) {
  parts = input_string.split("|");
  return parts.join("%7C");
}
