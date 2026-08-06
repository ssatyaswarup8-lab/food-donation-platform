const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    pickupLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    dropAddress: {
      type: String,
      required: true,
    },
    dropLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    status: {
      type: String,
      enum: ["pending_assignment", "assigned", "picked_up", "delivered", "completed", "cancelled"],
      default: "pending_assignment",
    },
    volunteerCurrentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    assignedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

deliverySchema.index({ pickupLocation: "2dsphere" });
deliverySchema.index({ dropLocation: "2dsphere" });

module.exports = mongoose.model("Delivery", deliverySchema);