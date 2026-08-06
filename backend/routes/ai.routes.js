const express = require("express");
const router = express.Router();

const {
  getSpoilagePrediction,
  getDemandPrediction,
  getRouteForDelivery,
} = require("../controllers/ai.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");


router.post("/spoilage-prediction", protect, authorizeRoles("donor"), getSpoilagePrediction);
router.get("/route-optimization/:deliveryId", protect, getRouteForDelivery);
router.get("/demand-prediction", protect, authorizeRoles("admin", "donor"), getDemandPrediction);

module.exports = router;