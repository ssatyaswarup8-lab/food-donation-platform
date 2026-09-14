const User = require("../models/User.model");
const Food = require("../models/Food.model");
const Claim = require("../models/Claim.model");
const Delivery = require("../models/Delivery.model");
const { success, error } = require("../utils/apiResponse");
const { logAction } = require("../services/auditLog.service");
const AuditLog = require("../models/AuditLog.model");

// ============================================================
// GET ALL USERS
// ============================================================

// @desc    Get all users (with optional role/verification filters)
// @route   GET /api/admin/users?role=ngo&verified=false
// @access  Private (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.verified !== undefined) {
      filter.isVerified = req.query.verified === "true";
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 });

    return success(
      res,
      200,
      "Users fetched successfully",
      users
    );
  } catch (err) {
    console.error("Get all users error:", err);

    return error(
      res,
      500,
      err.message || "Failed to fetch users"
    );
  }
};


// ============================================================
// VERIFY USER
// ============================================================

// @desc    Verify a donor/NGO/volunteer account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (admin only)
exports.verifyUser = async (req, res) => {
  try {
    console.log("====================================");
    console.log("VERIFY USER");
    console.log("User ID:", req.params.id);
    console.log("Admin ID:", req.user?.id);
    console.log("====================================");

    // --------------------------------------------------------
    // 1. Find user
    // --------------------------------------------------------

    const user = await User.findById(req.params.id);

    if (!user) {
      return error(
        res,
        404,
        "User not found"
      );
    }

    console.log("User found:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });

    // --------------------------------------------------------
    // 2. Check role
    // --------------------------------------------------------

    if (!user.role) {
      console.error(
        "Verification failed: user has no role"
      );

      return error(
        res,
        400,
        "User cannot be verified because their role is missing. Please assign a role first."
      );
    }

    const validRoles = [
      "donor",
      "ngo",
      "volunteer",
    ];

    if (!validRoles.includes(user.role)) {
      return error(
        res,
        400,
        `Invalid user role: ${user.role}`
      );
    }

    // --------------------------------------------------------
    // 3. If already verified
    // --------------------------------------------------------

    if (user.isVerified === true) {
      return success(
        res,
        200,
        `${user.name} is already verified`,
        user
      );
    }

    // --------------------------------------------------------
    // 4. IMPORTANT FIX
    //
    // Do NOT do:
    //
    // user.isVerified = true;
    // await user.save();
    //
    // because save() validates the entire document.
    //
    // Some old records may be missing required fields such
    // as role.
    //
    // We only need to update isVerified.
    // --------------------------------------------------------

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isVerified: true,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    if (!updatedUser) {
      return error(
        res,
        404,
        "User not found"
      );
    }

    console.log(
      "User verified successfully:",
      updatedUser._id.toString()
    );

    // --------------------------------------------------------
    // 5. Audit log
    //
    // Audit logging should NOT make verification fail.
    // --------------------------------------------------------

    try {
      await logAction({
        adminId: req.user.id,
        action: "verify_user",
        targetType: "User",
        targetId: updatedUser._id,
        details: `Verified ${updatedUser.role} account: ${updatedUser.email}`,
      });

      console.log(
        "Audit log created successfully"
      );
    } catch (auditError) {
      console.error(
        "Audit log error:",
        auditError
      );

      // Verification has already succeeded.
      // Do not return 500 because of audit logging.
    }

    // --------------------------------------------------------
    // 6. Return success
    // --------------------------------------------------------

    return success(
      res,
      200,
      `${updatedUser.name} has been verified`,
      updatedUser
    );

  } catch (err) {
    console.error(
      "===================================="
    );

    console.error(
      "VERIFY USER ERROR:"
    );

    console.error(err);

    console.error(
      "===================================="
    );

    return error(
      res,
      500,
      err.message || "Failed to verify user"
    );
  }
};


// ============================================================
// TOGGLE USER STATUS
// ============================================================

// @desc    Activate/deactivate a user account
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return error(
        res,
        404,
        "User not found"
      );
    }

    const newStatus = !user.isActive;

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isActive: newStatus,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    if (!updatedUser) {
      return error(
        res,
        404,
        "User not found"
      );
    }

    try {
      await logAction({
        adminId: req.user.id,
        action: "toggle_user_status",
        targetType: "User",
        targetId: updatedUser._id,
        details: `${
          updatedUser.isActive
            ? "Activated"
            : "Deactivated"
        } account: ${updatedUser.email}`,
      });
    } catch (auditError) {
      console.error(
        "Audit log error:",
        auditError
      );
    }

    return success(
      res,
      200,
      `User is now ${
        updatedUser.isActive
          ? "active"
          : "deactivated"
      }`,
      updatedUser
    );
  } catch (err) {
    console.error(
      "Toggle user status error:",
      err
    );

    return error(
      res,
      500,
      err.message || "Failed to update user status"
    );
  }
};


// ============================================================
// GET ALL DELIVERIES
// ============================================================

// @desc    Get all deliveries
// @route   GET /api/admin/deliveries?status=delivered
// @access  Private (admin only)
exports.getAllDeliveries = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const deliveries =
      await Delivery.find(filter)
        .populate(
          "donorId",
          "name organizationName"
        )
        .populate(
          "ngoId",
          "name organizationName"
        )
        .populate(
          "volunteerId",
          "name phone"
        )
        .populate(
          "foodId",
          "foodName quantity quantityUnit"
        )
        .sort({
          createdAt: -1,
        });

    return success(
      res,
      200,
      "Deliveries fetched successfully",
      deliveries
    );
  } catch (err) {
    console.error(
      "Get all deliveries error:",
      err
    );

    return error(
      res,
      500,
      err.message || "Failed to fetch deliveries"
    );
  }
};


// ============================================================
// GET ALL FOODS
// ============================================================

// @desc    Get all food listings
// @route   GET /api/admin/foods?status=expired
// @access  Private (admin only)
exports.getAllFoodsAdmin = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const foods =
      await Food.find(filter)
        .populate(
          "donorId",
          "name organizationName"
        )
        .sort({
          createdAt: -1,
        });

    return success(
      res,
      200,
      "Foods fetched successfully",
      foods
    );
  } catch (err) {
    console.error(
      "Get all foods error:",
      err
    );

    return error(
      res,
      500,
      err.message || "Failed to fetch foods"
    );
  }
};


// ============================================================
// ANALYTICS SUMMARY
// ============================================================

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
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$quantity",
            },
          },
        },
      ]),

      User.countDocuments({
        role: "ngo",
        isActive: true,
        isVerified: true,
      }),

      User.countDocuments({
        role: "volunteer",
        isActive: true,
        isVerified: true,
      }),

      User.countDocuments({
        role: "donor",
        isActive: true,
      }),

      Delivery.countDocuments({
        status: "completed",
      }),

      User.countDocuments({
        isVerified: false,
        role: {
          $ne: "admin",
        },
      }),
    ]);

    return success(
      res,
      200,
      "Analytics summary fetched",
      {
        totalFoodListingsPosted:
          totalFoodPosted,

        totalMealsDistributed:
          totalMealsDistributed[0]?.total || 0,

        activeNGOs,

        activeVolunteers,

        activeDonors,

        totalDeliveriesCompleted,

        pendingVerifications,
      }
    );
  } catch (err) {
    console.error(
      "Analytics summary error:",
      err
    );

    return error(
      res,
      500,
      err.message || "Failed to fetch analytics"
    );
  }
};


// ============================================================
// DAILY DONATIONS
// ============================================================

// @desc    Daily food donations - last 30 days
// @route   GET /api/admin/analytics/daily
// @access  Private (admin only)
exports.getDailyDonations = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );

    const data =
      await Food.aggregate([
        {
          $match: {
            createdAt: {
              $gte: thirtyDaysAgo,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            totalListings: {
              $sum: 1,
            },

            totalQuantity: {
              $sum: "$quantity",
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    return success(
      res,
      200,
      "Daily donations fetched",
      data
    );
  } catch (err) {
    console.error(
      "Daily donations error:",
      err
    );

    return error(
      res,
      500,
      err.message || "Failed to fetch daily donations"
    );
  }
};


// ============================================================
// MONTHLY DONATIONS
// ============================================================

// @desc    Monthly food donations - last 12 months
// @route   GET /api/admin/analytics/monthly
// @access  Private (admin only)
exports.getMonthlyDonations = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();

    twelveMonthsAgo.setMonth(
      twelveMonthsAgo.getMonth() - 12
    );

    const data =
      await Food.aggregate([
        {
          $match: {
            createdAt: {
              $gte: twelveMonthsAgo,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },

            totalListings: {
              $sum: 1,
            },

            totalQuantity: {
              $sum: "$quantity",
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    return success(
      res,
      200,
      "Monthly donations fetched",
      data
    );
  } catch (err) {
    console.error(
      "Monthly donations error:",
      err
    );

    return error(
      res,
      500,
      err.message || "Failed to fetch monthly donations"
    );
  }
};


// ============================================================
// FOOD CATEGORY BREAKDOWN
// ============================================================

// @desc    Food donations broken down by food type
// @route   GET /api/admin/analytics/categories
// @access  Private (admin only)
exports.getFoodCategoryBreakdown =
  async (req, res) => {
    try {
      const data =
        await Food.aggregate([
          {
            $group: {
              _id: "$foodType",

              count: {
                $sum: 1,
              },

              totalQuantity: {
                $sum: "$quantity",
              },
            },
          },
        ]);

      return success(
        res,
        200,
        "Food category breakdown fetched",
        data
      );
    } catch (err) {
      console.error(
        "Food category breakdown error:",
        err
      );

      return error(
        res,
        500,
        err.message ||
          "Failed to fetch food categories"
      );
    }
  };


// ============================================================
// APPROVE FOOD QUALITY
// ============================================================

// @desc    Approve food quality
// @route   PUT /api/admin/foods/:id/approve-quality
// @access  Private (admin only)
exports.approveFoodQuality = async (req, res) => {
  try {
    const food = await Food.findById(
      req.params.id
    );

    if (!food) {
      return error(
        res,
        404,
        "Food listing not found"
      );
    }

    food.qualityStatus = "approved";
    food.verifiedBy = req.user.id;
    food.verifiedAt = new Date();

    await food.save();

    try {
      const {
        notifyUser,
      } = require("../services/notification.service");

      await notifyUser(
        food.donorId,
        "food-quality-approved",
        {
          foodId: food._id,
          foodName: food.foodName,
        }
      );
    } catch (notificationError) {
      console.error(
        "Food approval notification error:",
        notificationError
      );
    }

    return success(
      res,
      200,
      "Food quality approved",
      food
    );
  } catch (err) {
    console.error(
      "Approve food quality error:",
      err
    );

    return error(
      res,
      500,
      err.message ||
        "Failed to approve food quality"
    );
  }
};


// ============================================================
// REJECT FOOD QUALITY
// ============================================================

// @desc    Reject food quality
// @route   PUT /api/admin/foods/:id/reject-quality
// @access  Private (admin only)
exports.rejectFoodQuality = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return error(
        res,
        400,
        "Please provide a rejection reason"
      );
    }

    const food = await Food.findById(
      req.params.id
    );

    if (!food) {
      return error(
        res,
        404,
        "Food listing not found"
      );
    }

    food.qualityStatus = "rejected";

    food.qualityRejectionReason =
      reason.trim();

    food.verifiedBy = req.user.id;

    food.verifiedAt = new Date();

    // Pull rejected food from availability
    food.status = "expired";

    await food.save();

    try {
      const {
        notifyUser,
      } = require("../services/notification.service");

      await notifyUser(
        food.donorId,
        "food-quality-rejected",
        {
          foodId: food._id,
          foodName: food.foodName,
          reason: reason.trim(),
        }
      );
    } catch (notificationError) {
      console.error(
        "Food rejection notification error:",
        notificationError
      );
    }

    return success(
      res,
      200,
      "Food quality rejected",
      food
    );
  } catch (err) {
    console.error(
      "Reject food quality error:",
      err
    );

    return error(
      res,
      500,
      err.message ||
        "Failed to reject food quality"
    );
  }
};


// ============================================================
// BULK VERIFY USERS
// ============================================================

// @desc    Bulk verify multiple users
// @route   PUT /api/admin/users/bulk-verify
// @access  Private (admin only)
exports.bulkVerifyUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (
      !Array.isArray(userIds) ||
      userIds.length === 0
    ) {
      return error(
        res,
        400,
        "userIds must be a non-empty array"
      );
    }

    const mongoose = require("mongoose");

    // Check IDs
    const invalidIds = userIds.filter(
      (id) =>
        !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return error(
        res,
        400,
        "One or more user IDs are invalid"
      );
    }

    // Find selected users
    const users = await User.find({
      _id: {
        $in: userIds,
      },
    }).select(
      "_id name email role isVerified"
    );

    if (users.length === 0) {
      return error(
        res,
        404,
        "No users found"
      );
    }

    // Check missing roles
    const usersWithoutRole =
      users.filter(
        (user) => !user.role
      );

    if (usersWithoutRole.length > 0) {
      return error(
        res,
        400,
        "One or more selected users have no role. Please assign their roles before verification."
      );
    }

    const validRoles = [
      "donor",
      "ngo",
      "volunteer",
    ];

    const invalidRoleUsers =
      users.filter(
        (user) =>
          !validRoles.includes(
            user.role
          )
      );

    if (invalidRoleUsers.length > 0) {
      return error(
        res,
        400,
        "One or more selected users have an invalid role."
      );
    }

    // Atomic update
    const result =
      await User.updateMany(
        {
          _id: {
            $in: userIds,
          },

          role: {
            $in: validRoles,
          },
        },
        {
          $set: {
            isVerified: true,
          },
        }
      );

    try {
      await logAction({
        adminId: req.user.id,
        action: "bulk_verify_users",
        details: `Bulk verified ${result.modifiedCount} users`,
      });
    } catch (auditError) {
      console.error(
        "Bulk verification audit log error:",
        auditError
      );
    }

    return success(
      res,
      200,
      `${result.modifiedCount} users verified`,
      {
        modifiedCount:
          result.modifiedCount,
      }
    );
  } catch (err) {
    console.error(
      "Bulk verify users error:",
      err
    );

    return error(
      res,
      500,
      err.message ||
        "Failed to verify users"
    );
  }
};


// ============================================================
// AUDIT LOGS
// ============================================================

// @desc    Get audit log history
// @route   GET /api/admin/audit-logs?action=verify_user
// @access  Private (admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const filter = {};

    if (req.query.action) {
      filter.action = req.query.action;
    }

    const logs =
      await AuditLog.find(filter)
        .populate(
          "adminId",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(200);

    return success(
      res,
      200,
      "Audit logs fetched",
      logs
    );
  } catch (err) {
    console.error(
      "Get audit logs error:",
      err
    );

    return error(
      res,
      500,
      err.message ||
        "Failed to fetch audit logs"
    );
  }
};


// ============================================================
// EXPORT DELIVERIES CSV
// ============================================================

// @desc    Export deliveries as CSV
// @route   GET /api/admin/export/deliveries
// @access  Private (admin only)
exports.exportDeliveriesCSV =
  async (req, res) => {
    try {
      const deliveries =
        await Delivery.find()
          .populate(
            "donorId",
            "name organizationName"
          )
          .populate(
            "ngoId",
            "name organizationName"
          )
          .populate(
            "volunteerId",
            "name"
          )
          .populate(
            "foodId",
            "foodName quantity quantityUnit"
          )
          .sort({
            createdAt: -1,
          });

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

      const rows =
        deliveries.map((d) => [
          d._id,
          d.foodId?.foodName || "",
          `${d.foodId?.quantity || ""} ${
            d.foodId?.quantityUnit || ""
          }`,
          d.donorId
            ?.organizationName ||
            d.donorId?.name ||
            "",
          d.ngoId
            ?.organizationName ||
            d.ngoId?.name ||
            "",
          d.volunteerId?.name ||
            "Not assigned",
          d.status || "",
          d.createdAt
            ? d.createdAt.toISOString()
            : "",
          d.completedAt
            ? d.completedAt.toISOString()
            : "",
        ]);

      const escapeCsv = (val) =>
        `"${String(val).replace(
          /"/g,
          '""'
        )}"`;

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map(escapeCsv)
            .join(",")
        )
        .join("\n");

      try {
        await logAction({
          adminId: req.user.id,
          action: "export_data",
          details: `Exported ${deliveries.length} deliveries as CSV`,
        });
      } catch (auditError) {
        console.error(
          "Export audit log error:",
          auditError
        );
      }

      res.setHeader(
        "Content-Type",
        "text/csv"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=deliveries-export.csv"
      );

      return res
        .status(200)
        .send(csv);

    } catch (err) {
      console.error(
        "Export deliveries CSV error:",
        err
      );

      return error(
        res,
        500,
        err.message ||
          "Failed to export deliveries"
      );
    }
  };


// ============================================================
// EXPORT USERS CSV
// ============================================================

// @desc    Export users as CSV
// @route   GET /api/admin/export/users
// @access  Private (admin only)
exports.exportUsersCSV =
  async (req, res) => {
    try {
      const users =
        await User.find()
          .sort({
            createdAt: -1,
          });

      const headers = [
        "Name",
        "Email",
        "Role",
        "Phone",
        "Verified",
        "Active",
        "Joined",
      ];

      const rows =
        users.map((u) => [
          u.name || "",
          u.email || "",
          u.role || "",
          u.phone || "",
          u.isVerified
            ? "Yes"
            : "No",
          u.isActive
            ? "Yes"
            : "No",
          u.createdAt
            ? u.createdAt.toISOString()
            : "",
        ]);

      const escapeCsv = (val) =>
        `"${String(val).replace(
          /"/g,
          '""'
        )}"`;

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map(escapeCsv)
            .join(",")
        )
        .join("\n");

      try {
        await logAction({
          adminId: req.user.id,
          action: "export_data",
          details: `Exported ${users.length} users as CSV`,
        });
      } catch (auditError) {
        console.error(
          "Export users audit log error:",
          auditError
        );
      }

      res.setHeader(
        "Content-Type",
        "text/csv"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=users-export.csv"
      );

      return res
        .status(200)
        .send(csv);

    } catch (err) {
      console.error(
        "Export users CSV error:",
        err
      );

      return error(
        res,
        500,
        err.message ||
          "Failed to export users"
      );
    }
  };