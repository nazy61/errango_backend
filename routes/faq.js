const { Router } = require("express");
const {
  get_faqs,
  get_faq_categories,
  migrate_faq_categories,
  migrate_faqs,
} = require("../controllers/faq_controller");
const log = require("../middlewares/logger");

const router = Router();

router.get("/faqs", log, get_faqs);
router.get("/get_faq_categories", log, get_faq_categories);
router.post("/migrate_faq_categories", log, migrate_faq_categories);
router.post("/migrate_faqs", log, migrate_faqs);

module.exports = router;
