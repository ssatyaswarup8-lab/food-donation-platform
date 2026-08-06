const express = require("express");
const router = express.Router();

const {
  claimFood,
  getMyClaims,
  cancelClaim,
  getDonorClaims,
} = require("../controllers/claim.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.post("/:foodId", protect, authorizeRoles("ngo"), claimFood);
router.get("/my-claims", protect, authorizeRoles("ngo"), getMyClaims);
router.put("/:id/cancel", protect, authorizeRoles("ngo"), cancelClaim);
router.get("/donor-claims", protect, authorizeRoles("donor"), getDonorClaims);

module.exports = router;