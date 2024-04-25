const { Router } = require("express");
const {
  get_tv_billers,
  get_tv_packages,
  buy_tv,
  verify_customer,
} = require("../controllers/tv_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/tv/buy", log, verifyToken, buy_tv);
router.post("/tv/verify", log, verifyToken, verify_customer);
router.get("/tv/billers", log, get_tv_billers);
router.get("/tv/:type", log, get_tv_packages);

module.exports = router;
