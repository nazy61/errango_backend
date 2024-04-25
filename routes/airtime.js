const { Router } = require("express");
const {
  get_airtime_billers,
  get_airtime_packages,
  send_airtime,
  add_beneficiary,
  get_beneficiaries,
  delete_beneficiary,
} = require("../controllers/airtime_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/airtime/vend", log, verifyToken, send_airtime);
router.post("/airtime/add/beneficiary", log, verifyToken, add_beneficiary);
router.get("/airtime/billers", log, get_airtime_billers);
router.get("/airtime/beneficiaries", log, verifyToken, get_beneficiaries);
router.get("/airtime/:type", log, get_airtime_packages);
router.delete(
  "/airtime/delete/beneficiary/:beneficiaryId",
  log,
  verifyToken,
  delete_beneficiary
);

module.exports = router;
