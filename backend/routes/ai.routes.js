const express = require("express");
const router = express.Router();

const {
  getSpoilagePrediction,
  getDemandPrediction,
  getRouteForDelivery,
} = require("../controllers/ai.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { spoilagePredictionValidation } = require("../validators/ai.validator");
const validate = require("../middlewares/validate.middleware");

router.post(
  "/spoilage-prediction",
  protect,
  authorizeRoles("donor"),
  spoilagePredictionValidation,
  validate,
  getSpoilagePrediction
);

router.get("/demand-prediction", protect, authorizeRoles("admin", "donor"), getDemandPrediction);
router.get("/route-optimization/:deliveryId", protect, getRouteForDelivery);

module.exports = router;