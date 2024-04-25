const { Router } = require("express");
const {
  get_electricity_billers,
  get_electricity_packages,
  buy_electricity,
  verify_customer,
} = require("../controllers/electricity_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/electricity/buy", log, verifyToken, buy_electricity);
router.post("/electricity/verify", log, verify_customer);
router.get("/electricity/billers", log, get_electricity_billers);
router.get("/electricity/:type", log, get_electricity_packages);

module.exports = router;
