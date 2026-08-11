const Food = require("../models/Food.model");
const Claim = require("../models/Claim.model");
const { success, error } = require("../utils/apiResponse");
const Delivery = require("../models/Delivery.model");
const { notifyUser, broadcastEvent } = require("../services/notification.service");
const { sendFoodClaimedEmail } = require("../services/notificationEmail.service");

// @desc    NGO claims a food listing
// @route   POST /api/claims/:foodId
// @access  Private (ngo only)
exports.claimFood = async (req, res) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findById(foodId);
    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    if (new Date() > food.expiresAt) {
      return error(res, 400, "This food listing has expired");
    }

    // Atomic update: only succeeds if status is still "available".
    // Prevents two NGOs claiming the same food at the same time (race condition).
    const updatedFood = await Food.findOneAndUpdate(
      { _id: foodId, status: "available" },
      { $set: { status: "claimed" } },
      { new: true }
    );

    if (!updatedFood) {
      return error(res, 409, "This food has already been claimed by another NGO");
    }

   const claim = await Claim.create({
  foodId: food._id,
  ngoId: req.user.id,
  donorId: food.donorId,
  status: "claimed",
});

const ngo = await require("../models/User.model").findById(req.user.id);

const delivery = await Delivery.create({
  foodId: food._id,
  claimId: claim._id,
  donorId: food.donorId,
  ngoId: req.user.id,
  pickupAddress: food.pickupAddress,
  pickupLocation: food.location,
  dropAddress: ngo.address,
  dropLocation: ngo.location,
  status: "pending_assignment",
});
claim.deliveryId = delivery._id;
await claim.save();

updatedFood.deliveryId = delivery._id;
await updatedFood.save();


notifyUser(food.donorId, "food-claimed", {
  foodId: food._id,
  foodName: food.foodName,
  claimedBy: ngo.organizationName || ngo.name,
});

const donorUser = await require("../models/User.model").findById(food.donorId);
    if (donorUser) {
      sendFoodClaimedEmail(donorUser.email, donorUser.name, food.foodName, ngo.organizationName || ngo.name);
    }

return success(
  res,
  201,
  "Food claimed successfully",
  { 
    claim, 
    food: updatedFood,
    delivery
  }
);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get logged-in NGO's claims
// @route   GET /api/claims/my-claims
// @access  Private (ngo only)
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ ngoId: req.user.id })
      .populate("foodId")
      .populate("donorId", "name organizationName phone address")
      .sort({ createdAt: -1 });

    return success(res, 200, "Your claims fetched", claims);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Cancel a claim (reverts food back to available)
// @route   PUT /api/claims/:id/cancel
// @access  Private (ngo who claimed it)
exports.cancelClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return error(res, 404, "Claim not found");
    }

    if (claim.ngoId.toString() !== req.user.id) {
      return error(res, 403, "Not authorized to cancel this claim");
    }

    if (claim.status !== "claimed") {
      return error(res, 400, "Only active claims can be cancelled");
    }

    claim.status = "cancelled";
    claim.cancelledAt = new Date();
    await claim.save();

    await Food.findByIdAndUpdate(claim.foodId, { status: "available" });

    return success(res, 200, "Claim cancelled, food is available again");
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get all claims for a donor's food listings
// @route   GET /api/claims/donor-claims
// @access  Private (donor only)
exports.getDonorClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ donorId: req.user.id })
      .populate("foodId")
      .populate("ngoId", "name organizationName phone address")
      .sort({ createdAt: -1 });

    return success(res, 200, "Claims on your listings fetched", claims);
  } catch (err) {
    return error(res, 500, err.message);
  }
};