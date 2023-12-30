const { Router } = require("express");
const userMethods = require("../controllers/user_controller");
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

router.get("/users", log, verifyToken, userMethods.get_users);
router.get("/user/:userId", log, verifyToken, userMethods.get_user);
router.get(
  "/user/wallet/runner",
  log,
  verifyToken,
  userMethods.get_user_runner_wallet
);
router.get(
  "/user/wallet/errango",
  log,
  verifyToken,
  userMethods.get_user_errango_wallet
);
router.post(
  "/user/profile/picture",
  log,
  verifyToken,
  upload.single("image"),
  userMethods.update_profile_picture
);
router.post("/user/go/online", log, verifyToken, userMethods.go_online);
router.post("/user/go/offline", log, verifyToken, userMethods.go_offline);
router.post("/user/disable", log, verifyToken, userMethods.disable_account);

module.exports = router;
