const { Router } = require("express");
const {
  get_mobile_data_billers,
  get_mobile_data_packages,
  send_mobile_data,
} = require("../controllers/mobile_data_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/mobile/data/vend", log, verifyToken, send_mobile_data);
router.get("/mobile/data/billers", log, get_mobile_data_billers);
router.get("/mobile/data/:type", log, get_mobile_data_packages);

module.exports = router;
