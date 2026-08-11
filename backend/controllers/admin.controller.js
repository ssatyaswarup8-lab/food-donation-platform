const User = require("../models/User.model");
const Food = require("../models/Food.model");
const Claim = require("../models/Claim.model");
const Delivery = require("../models/Delivery.model");
const { success, error } = require("../utils/apiResponse");
const { logAction } = require("../services/auditLog.service");
const AuditLog = require("../models/AuditLog.model");

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

    await logAction({
      adminId: req.user.id,
      action: "verify_user",
      targetType: "User",
      targetId: user._id,
      details: `Verified ${user.role} account: ${user.email}`,
    });

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

    await logAction({
      adminId: req.user.id,
      action: "toggle_user_status",
      targetType: "User",
      targetId: user._id,
      details: `${user.isActive ? "Activated" : "Deactivated"} account: ${user.email}`,
    });

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


// @desc    Bulk verify multiple users at once
// @route   PUT /api/admin/users/bulk-verify
// @access  Private (admin only)
exports.bulkVerifyUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return error(res, 400, "userIds must be a non-empty array");
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isVerified: true } }
    );

    await logAction({
      adminId: req.user.id,
      action: "bulk_verify_users",
      details: `Bulk verified ${result.modifiedCount} users`,
    });

    return success(res, 200, `${result.modifiedCount} users verified`, {
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get audit log history
// @route   GET /api/admin/audit-logs?action=verify_user
// @access  Private (admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.action) filter.action = req.query.action;

    const logs = await AuditLog.find(filter)
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    return success(res, 200, "Audit logs fetched", logs);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Export deliveries as CSV
// @route   GET /api/admin/export/deliveries
// @access  Private (admin only)
exports.exportDeliveriesCSV = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("donorId", "name organizationName")
      .populate("ngoId", "name organizationName")
      .populate("volunteerId", "name")
      .populate("foodId", "foodName quantity quantityUnit")
      .sort({ createdAt: -1 });

    const headers = [
      "Delivery ID",
      "Food Name",
      "Quantity",
      "Donor",
      "NGO",
      "Volunteer",
      "Status",
      "Created At",
      "Completed At",
    ];

    const rows = deliveries.map((d) => [
      d._id,
      d.foodId?.foodName || "",
      `${d.foodId?.quantity || ""} ${d.foodId?.quantityUnit || ""}`,
      d.donorId?.organizationName || d.donorId?.name || "",
      d.ngoId?.organizationName || d.ngoId?.name || "",
      d.volunteerId?.name || "Not assigned",
      d.status,
      d.createdAt ? d.createdAt.toISOString() : "",
      d.completedAt ? d.completedAt.toISOString() : "",
    ]);

    const escapeCsv = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

    await logAction({
      adminId: req.user.id,
      action: "export_data",
      details: `Exported ${deliveries.length} deliveries as CSV`,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=deliveries-export.csv");
    res.status(200).send(csv);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Export users as CSV
// @route   GET /api/admin/export/users
// @access  Private (admin only)
exports.exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const headers = ["Name", "Email", "Role", "Phone", "Verified", "Active", "Joined"];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.role,
      u.phone,
      u.isVerified ? "Yes" : "No",
      u.isActive ? "Yes" : "No",
      u.createdAt ? u.createdAt.toISOString() : "",
    ]);

    const escapeCsv = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

    await logAction({
      adminId: req.user.id,
      action: "export_data",
      details: `Exported ${users.length} users as CSV`,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users-export.csv");
    res.status(200).send(csv);
  } catch (err) {
    return error(res, 500, err.message);
  }
};