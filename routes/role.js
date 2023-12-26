const { Router } = require("express");
const {
  get_roles,
  get_role,
  create_role,
  update_role,
  delete_role,
  migrate_roles,
} = require("../controllers/role_controller");
const log = require("../middlewares/logger");
const { verifyToken } = require("../middlewares/auth");

const router = Router();

router.post("/role", log, verifyToken, create_role);
router.post("/migrate_roles", log, verifyToken, migrate_roles);
router.get("/roles", log, get_roles);
router.get("/role/:roleId", log, verifyToken, get_role);
router.put("/role/:roleId", log, verifyToken, update_role);
router.delete("/role/:roleId", log, verifyToken, delete_role);

module.exports = router;
