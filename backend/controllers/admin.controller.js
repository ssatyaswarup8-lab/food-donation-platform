const User = require("../models/User.model");
const Food = require("../models/Food.model");
const Claim = require("../models/Claim.model");
const Delivery = require("../models/Delivery.model");
const { success, error } = require("../utils/apiResponse");

// @desc    Get all users (with optional role/verification filters)
// @route   GET /api/admin/users?role=ngo&verified=false
// @access  Private (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.verified !== undefined) filter.isVerified = req.query.verified === "true";

    const users = await User.find(filter).sort({ createdAt: -1 });
    return success(res, 200, "Users fetched successfully", users);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Verify a donor/NGO/volunteer account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (admin only)
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 404, "User not found");
    }

    user.isVerified = true;
    await user.save();

    return success(res, 200, `${user.name} has been verified`, user);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Activate/deactivate a user account
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 404, "User not found");
    }

    user.isActive = !user.isActive;
    await user.save();

    return success(res, 200, `User is now ${user.isActive ? "active" : "deactivated"}`, user);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get all deliveries (monitor platform activity)
// @route   GET /api/admin/deliveries?status=delivered
// @access  Private (admin only)
exports.getAllDeliveries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const deliveries = await Delivery.find(filter)
      .populate("donorId", "name organizationName")
      .populate("ngoId", "name organizationName")
      .populate("volunteerId", "name phone")
      .populate("foodId", "foodName quantity quantityUnit")
      .sort({ createdAt: -1 });

    return success(res, 200, "Deliveries fetched successfully", deliveries);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get all food listings (admin view, any status)
// @route   GET /api/admin/foods?status=expired
// @access  Private (admin only)
exports.getAllFoodsAdmin = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const foods = await Food.find(filter)
      .populate("donorId", "name organizationName")
      .sort({ createdAt: -1 });

    return success(res, 200, "Foods fetched successfully", foods);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Platform-wide analytics summary
// @route   GET /api/admin/analytics/summary
// @access  Private (admin only)
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const [
      totalFoodPosted,
      totalMealsDistributed,
      activeNGOs,
      activeVolunteers,
      activeDonors,
      totalDeliveriesCompleted,
      pendingVerifications,
    ] = await Promise.all([
      Food.countDocuments(),
      Food.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),
      User.countDocuments({ role: "ngo", isActive: true, isVerified: true }),
      User.countDocuments({ role: "volunteer", isActive: true, isVerified: true }),
      User.countDocuments({ role: "donor", isActive: true }),
      Delivery.countDocuments({ status: "completed" }),
      User.countDocuments({ isVerified: false, role: { $ne: "admin" } }),
    ]);

    return success(res, 200, "Analytics summary fetched", {
      totalFoodListingsPosted: totalFoodPosted,
      totalMealsDistributed: totalMealsDistributed[0]?.total || 0,
      activeNGOs,
      activeVolunteers,
      activeDonors,
      totalDeliveriesCompleted,
      pendingVerifications,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Daily food donations (last 30 days) — for line/bar chart
// @route   GET /api/admin/analytics/daily
// @access  Private (admin only)
exports.getDailyDonations = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await Food.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalListings: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return success(res, 200, "Daily donations fetched", data);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Monthly food donations (last 12 months) — for chart
// @route   GET /api/admin/analytics/monthly
// @access  Private (admin only)
exports.getMonthlyDonations = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const data = await Food.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalListings: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return success(res, 200, "Monthly donations fetched", data);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Food donations broken down by food type — for pie chart
// @route   GET /api/admin/analytics/categories
// @access  Private (admin only)
exports.getFoodCategoryBreakdown = async (req, res) => {
  try {
    const data = await Food.aggregate([
      {
        $group: {
          _id: "$foodType",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    return success(res, 200, "Food category breakdown fetched", data);
  } catch (err) {
    return error(res, 500, err.message);
  }
};
// @desc    Approve food quality (after donor uploads photo)
// @route   PUT /api/admin/foods/:id/approve-quality
// @access  Private (admin only)
exports.approveFoodQuality = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    food.qualityStatus = "approved";
    food.verifiedBy = req.user.id;
    food.verifiedAt = new Date();
    await food.save();

    const { notifyUser } = require("../services/notification.service");
    notifyUser(food.donorId, "food-quality-approved", {
      foodId: food._id,
      foodName: food.foodName,
    });

    return success(res, 200, "Food quality approved", food);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Reject food quality (with reason)
// @route   PUT /api/admin/foods/:id/reject-quality
// @access  Private (admin only)
exports.rejectFoodQuality = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return error(res, 400, "Please provide a rejection reason");
    }

    const food = await Food.findById(req.params.id);
    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    food.qualityStatus = "rejected";
    food.qualityRejectionReason = reason;
    food.verifiedBy = req.user.id;
    food.verifiedAt = new Date();
    food.status = "expired"; // pull it from availability
    await food.save();

    const { notifyUser } = require("../services/notification.service");
    notifyUser(food.donorId, "food-quality-rejected", {
      foodId: food._id,
      foodName: food.foodName,
      reason,
    });

    return success(res, 200, "Food quality rejected", food);
  } catch (err) {
    return error(res, 500, err.message);
  }
};