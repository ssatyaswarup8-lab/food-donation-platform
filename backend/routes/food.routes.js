const express = require("express");
const router = express.Router();
const { getNearbyFoods, getNearbyNGOsForFood } = require("../controllers/food.controller");

const {
  createFood,
  getAllFoods,
  getFoodById,
  getMyFoods,
  updateFood,
  deleteFood,
} = require("../controllers/food.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

// Order matters: /my-listings must come before /:id
router.get("/my-listings", protect, authorizeRoles("donor"), getMyFoods);
router.get("/nearby", protect, authorizeRoles("ngo"), getNearbyFoods);

router.post("/", protect, authorizeRoles("donor"), upload.single("image"), createFood);
router.get("/", protect, getAllFoods);
router.get("/:id/nearby-ngos", protect, authorizeRoles("donor"), getNearbyNGOsForFood);
router.get("/:id", protect, getFoodById);
router.put("/:id", protect, authorizeRoles("donor"), upload.single("image"), updateFood);
router.delete("/:id", protect, authorizeRoles("donor"), deleteFood);

module.exports = router;