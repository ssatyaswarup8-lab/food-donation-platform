const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  verifyUser,
  toggleUserStatus,
  getAllDeliveries,
  getAllFoodsAdmin,
  getAnalyticsSummary,
  getDailyDonations,
  getMonthlyDonations,
  getFoodCategoryBreakdown,
  approveFoodQuality,
  rejectFoodQuality,
} = require("../controllers/admin.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// All admin routes require admin role
router.use(protect, authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/toggle-status", toggleUserStatus);

router.get("/deliveries", getAllDeliveries);
router.get("/foods", getAllFoodsAdmin);

router.get("/analytics/summary", getAnalyticsSummary);
router.get("/analytics/daily", getDailyDonations);
router.get("/analytics/monthly", getMonthlyDonations);
router.get("/analytics/categories", getFoodCategoryBreakdown);
router.put("/foods/:id/approve-quality", approveFoodQuality);
router.put("/foods/:id/reject-quality", rejectFoodQuality);

module.exports = router;