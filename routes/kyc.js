const { Router } = require("express");
const {
  get_user_kyc,
  get_kycs,
  create_user_kyc,
  approve_user_kyc,
  decline_user_kyc,
} = require("../controllers/kyc_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");
const multer = require("multer");

const router = Router();
// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // Adjust the maximum file size (1 MB in this example)
  },
});

router.get("/kyc/:userId", log, get_user_kyc);
router.post("/kyc/approve/:userId", log, approve_user_kyc);
router.post("/kyc/decline/:userId", log, decline_user_kyc);
router.get("/kycs", log, get_kycs);
router.post(
  "/kyc",
  log,
  verifyToken,
  upload.fields([
    { name: "docFile", maxCount: 1 },
    { name: "faceImage", maxCount: 1 },
  ]),
  create_user_kyc
);

module.exports = router;
