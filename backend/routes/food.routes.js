const express = require("express");
const router = express.Router();

const {
  createFood,
  getAllFoods,
  getFoodById,
  getMyFoods,
  updateFood,
  deleteFood,
  getNearbyFoods,
  getNearbyNGOsForFood,
} = require("../controllers/food.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");
const { createFoodValidation, updateFoodValidation } = require("../validators/food.validator");
const validate = require("../middlewares/validate.middleware");
const { createFoodLimiter } = require("../middlewares/rateLimiter.middleware");

router.get("/my-listings", protect, authorizeRoles("donor"), getMyFoods);
router.get("/nearby", protect, authorizeRoles("ngo"), getNearbyFoods);

router.post(
  "/",
  protect,
  authorizeRoles("donor"),
  createFoodLimiter,
  upload.single("image"),
  createFoodValidation,
  validate,
  createFood
);

router.get("/", protect, getAllFoods);
router.get("/:id/nearby-ngos", protect, authorizeRoles("donor"), getNearbyNGOsForFood);
router.get("/:id", protect, getFoodById);

router.put(
  "/:id",
  protect,
  authorizeRoles("donor"),
  upload.single("image"),
  updateFoodValidation,
  validate,
  updateFood
);

router.delete("/:id", protect, authorizeRoles("donor"), deleteFood);

module.exports = router;