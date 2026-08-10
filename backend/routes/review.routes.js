const express = require("express");
const router = express.Router();

const {
  createReview,
  getUserReviews,
  getMyGivenReviews,
  getReviewableParticipants,
} = require("../controllers/review.controller");

const { protect } = require("../middlewares/auth.middleware");
const { createReviewValidation } = require("../validators/review.validator");
const validate = require("../middlewares/validate.middleware");

router.get("/given", protect, getMyGivenReviews);
router.get("/user/:userId", protect, getUserReviews);
router.get("/:deliveryId/reviewable", protect, getReviewableParticipants);
router.post("/:deliveryId", protect, createReviewValidation, validate, createReview);

module.exports = router;