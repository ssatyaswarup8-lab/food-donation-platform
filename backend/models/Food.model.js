const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
    },
    quantityUnit: {
      type: String,
      enum: ["plates", "kg", "packets", "liters"],
      default: "plates",
    },
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "mixed"],
      required: [true, "Food type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    preparedAt: {
      type: Date,
      required: [true, "Prepared time is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
    },
    image: {
      type: String,
      default: "",
    },
    qualityStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    qualityRejectionReason: {
      type: String,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Delivery",
    },
    pickupAddress: {
      type: String,
      required: [true, "Pickup address is required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["available", "claimed", "picked_up", "delivered", "completed", "expired"],
      default: "available",
    },
  },
  { timestamps: true }
);

foodSchema.index({ location: "2dsphere" });

// Auto-expire listings past expiry time (checked in queries, not deleted)
foodSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model("Food", foodSchema);