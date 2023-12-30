const { Router } = require("express");
const errandMethods = require("../controllers/errand_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.get("/errands", log, verifyToken, errandMethods.get_errands);
router.get("/errand/:errandId", log, verifyToken, errandMethods.get_errand);
router.get("/my/errands", log, verifyToken, errandMethods.get_my_errands);
router.get("/my/requests", log, verifyToken, errandMethods.get_my_requests);
router.get(
  "/errand/:errandId/messages",
  log,
  verifyToken,
  errandMethods.get_errand_messages
);
router.get(
  "/errand/:errandId/bids",
  log,
  verifyToken,
  errandMethods.get_errand_bids
);
router.post("/errand", log, verifyToken, errandMethods.request_errand);
router.post("/errand/bid", log, verifyToken, errandMethods.bid_errand);
router.post(
  "/errand/accept",
  log,
  verifyToken,
  errandMethods.accept_errand_request
);
router.post(
  "/errand/create/chat",
  log,
  verifyToken,
  errandMethods.create_errand_chat
);
router.post(
  "/errand/message/send",
  log,
  verifyToken,
  errandMethods.send_errand_message
);
router.post(
  "/errand/end/session/:errandId",
  log,
  verifyToken,
  errandMethods.end_errand_session
);
router.post("/errand/review", log, verifyToken, errandMethods.review_errand);
router.post("/errand/fund", log, verifyToken, errandMethods.fund_errand);
router.delete(
  "/errand/:errandId/delete",
  log,
  verifyToken,
  errandMethods.delete_my_errand
);
router.delete(
  "/errand/request/:errandId/delete",
  log,
  verifyToken,
  errandMethods.delete_my_request
);

module.exports = router;
