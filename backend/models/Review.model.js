const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromRole: {
      type: String,
      enum: ["donor", "ngo", "volunteer"],
      required: true,
    },
    toRole: {
      type: String,
      enum: ["donor", "ngo", "volunteer"],
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One reviewer can only review the same person once per delivery
reviewSchema.index({ deliveryId: 1, fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);