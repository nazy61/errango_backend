const { Router } = require("express");
const authMethods = require("../controllers/auth_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/admin", log, authMethods.create_admin);
router.post("/admin/login", log, authMethods.login_admin);
router.post("/user", log, authMethods.create_user);
router.post("/user/login", log, authMethods.user_login);
router.post("/user/resend/otp", log, authMethods.resend_otp);
router.post("/user/verify/otp", log, authMethods.verify_otp);
router.post("/user/set/pin", log, verifyToken, authMethods.set_pin);
router.post("/user/forgot/password", log, authMethods.forgot_password);
router.post(
  "/user/forgot/password/verify/otp",
  log,
  authMethods.forgot_password_verify_otp
);
router.post(
  "/user/forgot/password/resend/otp",
  log,
  authMethods.forgot_password_resend_otp
);
router.post(
  "/user/forgot/password/create/password",
  log,
  verifyToken,
  authMethods.forgot_password_create_password
);

module.exports = router;