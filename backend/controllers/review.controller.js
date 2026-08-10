const Review = require("../models/Review.model");
const Delivery = require("../models/Delivery.model");
const User = require("../models/User.model");
const { success, error } = require("../utils/apiResponse");

// @desc    Submit a review for someone involved in a completed delivery
// @route   POST /api/reviews/:deliveryId
// @access  Private (donor, ngo, volunteer)
exports.createReview = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { toUserId, rating, comment } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return error(res, 404, "Delivery not found");
    }

    if (delivery.status !== "completed") {
      return error(res, 400, "Reviews can only be submitted after the delivery is completed");
    }

    const participantIds = {
      [delivery.donorId.toString()]: "donor",
      [delivery.ngoId.toString()]: "ngo",
      [delivery.volunteerId ? delivery.volunteerId.toString() : ""]: "volunteer",
    };

    const fromRole = participantIds[req.user.id];
    const toRole = participantIds[toUserId];

    if (!fromRole) {
      return error(res, 403, "You were not part of this delivery");
    }

    if (!toRole) {
      return error(res, 400, "The user you're reviewing was not part of this delivery");
    }

    if (req.user.id === toUserId) {
      return error(res, 400, "You cannot review yourself");
    }

    // Sensible pairing rules: NGO <-> Donor, NGO <-> Volunteer, Donor <-> Volunteer
    const validPairs = ["donor-ngo", "ngo-donor", "ngo-volunteer", "volunteer-ngo", "donor-volunteer", "volunteer-donor"];
    if (!validPairs.includes(`${fromRole}-${toRole}`)) {
      return error(res, 400, "Invalid review pairing");
    }

    const review = await Review.create({
      deliveryId,
      fromUserId: req.user.id,
      toUserId,
      fromRole,
      toRole,
      rating,
      comment,
    });

    return success(res, 201, "Review submitted successfully", review);
  } catch (err) {
    if (err.code === 11000) {
      return error(res, 400, "You have already reviewed this person for this delivery");
    }
    return error(res, 500, err.message);
  }
};

// @desc    Get all reviews received by a specific user (their public rating profile)
// @route   GET /api/reviews/user/:userId
// @access  Private (any logged-in user)
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ toUserId: userId })
      .populate("fromUserId", "name organizationName role")
      .populate("deliveryId", "foodId")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    return success(res, 200, "User reviews fetched", {
      averageRating: avgRating,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get reviews the logged-in user has given
// @route   GET /api/reviews/given
// @access  Private
exports.getMyGivenReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ fromUserId: req.user.id })
      .populate("toUserId", "name organizationName role")
      .sort({ createdAt: -1 });

    return success(res, 200, "Your given reviews fetched", reviews);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get reviewable participants + which ones are already reviewed, for a delivery
// @route   GET /api/reviews/:deliveryId/reviewable
// @access  Private (donor, ngo, volunteer involved)
exports.getReviewableParticipants = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate("donorId", "name organizationName role")
      .populate("ngoId", "name organizationName role")
      .populate("volunteerId", "name role");

    if (!delivery) {
      return error(res, 404, "Delivery not found");
    }

    if (delivery.status !== "completed") {
      return error(res, 400, "Delivery is not completed yet");
    }

    const participants = [delivery.donorId, delivery.ngoId, delivery.volunteerId].filter(
      (p) => p && p._id.toString() !== req.user.id
    );

    const alreadyReviewed = await Review.find({
      deliveryId,
      fromUserId: req.user.id,
    }).select("toUserId");

    const reviewedIds = alreadyReviewed.map((r) => r.toUserId.toString());

    const result = participants.map((p) => ({
      _id: p._id,
      name: p.name,
      organizationName: p.organizationName,
      role: p.role,
      alreadyReviewed: reviewedIds.includes(p._id.toString()),
    }));

    return success(res, 200, "Reviewable participants fetched", result);
  } catch (err) {
    return error(res, 500, err.message);
  }
};