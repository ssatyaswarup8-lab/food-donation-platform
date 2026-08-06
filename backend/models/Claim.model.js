const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    status: {
      type: String,
      enum: ["claimed", "cancelled", "completed"],
      default: "claimed",
    },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);