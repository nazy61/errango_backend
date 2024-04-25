const { Router } = require("express");
const {
  get_betting_billers,
  get_betting_packages,
  top_up_bet_account,
  verify_customer,
} = require("../controllers/betting_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/betting/topup", log, verifyToken, top_up_bet_account);
router.post("/betting/verify", log, verifyToken, verify_customer);
router.get("/betting/billers", log, get_betting_billers);
router.get("/betting/:type", log, get_betting_packages);

module.exports = router;
