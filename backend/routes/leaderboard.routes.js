const express = require("express");
const router = express.Router();

const { getTopDonors, getTopVolunteers, getTopNGOs } = require("../controllers/leaderboard.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/donors", protect, getTopDonors);
router.get("/volunteers", protect, getTopVolunteers);
router.get("/ngos", protect, getTopNGOs);

module.exports = router;