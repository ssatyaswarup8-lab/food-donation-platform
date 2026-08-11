const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "verify_user",
        "toggle_user_status",
        "approve_food_quality",
        "reject_food_quality",
        "assign_volunteer",
        "bulk_verify_users",
        "export_data",
      ],
    },
    targetType: {
      type: String,
      enum: ["User", "Food", "Delivery"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);