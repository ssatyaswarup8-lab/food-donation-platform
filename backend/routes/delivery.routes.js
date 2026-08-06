const express = require("express");
const router = express.Router();

const {
  assignVolunteer,
  getMyDeliveries,
  updateDeliveryStatus,
  getDeliveryById,
} = require("../controllers/delivery.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/my-deliveries", protect, authorizeRoles("volunteer"), getMyDeliveries);
router.post("/:id/assign", protect, authorizeRoles("admin"), assignVolunteer);
router.put("/:id/status", protect, authorizeRoles("volunteer"), updateDeliveryStatus);
router.get("/:id", protect, getDeliveryById);

module.exports = router;