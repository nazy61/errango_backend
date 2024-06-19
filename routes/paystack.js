const { Router } = require("express");
const {
  initialize_payment,
  verify_payment,
} = require("../controllers/paystack_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/paystack/initialize", log, verifyToken, initialize_payment);
router.post("/paystack/verify", log, verifyToken, verify_payment);

module.exports = router;
