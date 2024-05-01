const { Router } = require("express");
const {
  get_banks,
  validate_account_number,
  add_beneficiary,
  get_beneficiaries,
  initiate_bank_tranfer,
  get_transfer_history,
  report_transaction,
  complete_bank_tranfer,
  get_transfer_history_between_two_users,
  initialize_credit,
  pay_with_bank_transfer,
  charge_card,
  charge_card_otp,
  verify_transaction,
} = require("../controllers/monnify_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post(
  "/monnify/account/verify",
  log,
  verifyToken,
  validate_account_number
);
router.post("/beneficiary/add", log, verifyToken, add_beneficiary);
router.post(
  "/monnify/transfer/initiate",
  log,
  verifyToken,
  initiate_bank_tranfer
);
router.post(
  "/monnify/transfer/complete",
  log,
  verifyToken,
  complete_bank_tranfer
);
router.post("/monnify/credit/initialize", log, verifyToken, initialize_credit);
router.post(
  "/monnify/credit/transfer",
  log,
  verifyToken,
  pay_with_bank_transfer
);
router.post("/monnify/credit/card", log, verifyToken, charge_card);
router.post("/monnify/credit/card/otp", log, verifyToken, charge_card_otp);
router.post("/monnify/credit/verify", log, verifyToken, verify_transaction);
router.post(
  "/transfer/report_transaction",
  log,
  verifyToken,
  report_transaction
);
router.get("/monnify/banks", log, verifyToken, get_banks);
router.get("/beneficiaries", log, verifyToken, get_beneficiaries);
router.get("/transfer/history", log, verifyToken, get_transfer_history);
router.get(
  "/transfer/history/:accountNumber",
  log,
  verifyToken,
  get_transfer_history_between_two_users
);

module.exports = router;
