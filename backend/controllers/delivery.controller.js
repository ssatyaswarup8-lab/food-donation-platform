const Delivery = require("../models/Delivery.model");
const Food = require("../models/Food.model");
const User = require("../models/User.model");
const { success, error } = require("../utils/apiResponse");
const { notifyUser, notifyDeliveryRoom, broadcastEvent } = require("../services/notification.service");

// @desc    Auto-assign nearest available volunteer to a delivery
// @route   POST /api/deliveries/:id/assign
// @access  Private (admin, or triggered internally after claim)
exports.assignVolunteer = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return error(res, 404, "Delivery not found");
    }

    if (delivery.volunteerId) {
      return error(res, 400, "Volunteer already assigned to this delivery");
    }

    // Find nearest available/active volunteer to pickup location
    const volunteer = await User.findOne({
      role: "volunteer",
      isVerified: true,
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: delivery.pickupLocation.coordinates },
          $maxDistance: 15000, // 15 km
        },
      },
    });

    if (!volunteer) {
      return error(res, 404, "No available volunteers found nearby");
    }

    delivery.volunteerId = volunteer._id;
    delivery.status = "assigned";
    delivery.assignedAt = new Date();
    await delivery.save();

    notifyUser(volunteer._id, "delivery-assigned", {
      deliveryId: delivery._id,
      pickupAddress: delivery.pickupAddress,
      dropAddress: delivery.dropAddress,
    });
    notifyUser(delivery.donorId, "volunteer-assigned", { deliveryId: delivery._id, volunteer: volunteer.name });
    notifyUser(delivery.ngoId, "volunteer-assigned", { deliveryId: delivery._id, volunteer: volunteer.name });

    return success(res, 200, "Volunteer assigned successfully", delivery);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Volunteer accepts/views their assigned deliveries
// @route   GET /api/deliveries/my-deliveries
// @access  Private (volunteer only)
exports.getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ volunteerId: req.user.id })
      .populate("donorId", "name organizationName phone address")
      .populate("ngoId", "name organizationName phone address")
      .populate("foodId", "foodName quantity quantityUnit")
      .sort({ createdAt: -1 });

    return success(res, 200, "Your deliveries fetched", deliveries);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Update delivery status (picked_up / delivered / completed)
// @route   PUT /api/deliveries/:id/status
// @access  Private (volunteer assigned to this delivery)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      assigned: "picked_up",
      picked_up: "delivered",
      delivered: "completed",
    };

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return error(res, 404, "Delivery not found");
    }

    if (delivery.volunteerId.toString() !== req.user.id) {
      return error(res, 403, "Not authorized for this delivery");
    }

    if (validTransitions[delivery.status] !== status) {
      return error(
        res,
        400,
        `Invalid status transition from '${delivery.status}' to '${status}'`
      );
    }

    delivery.status = status;
    if (status === "picked_up") delivery.pickedUpAt = new Date();
    if (status === "delivered") delivery.deliveredAt = new Date();
    if (status === "completed") delivery.completedAt = new Date();

    await delivery.save();

    // Keep Food status in sync
    if (status === "picked_up") {
      await Food.findByIdAndUpdate(delivery.foodId, { status: "picked_up" });
    }
    if (status === "delivered") {
      await Food.findByIdAndUpdate(delivery.foodId, { status: "delivered" });
    }
    if (status === "completed") {
      await Food.findByIdAndUpdate(delivery.foodId, { status: "completed" });
    }

    notifyUser(delivery.donorId, "delivery-status-update", { deliveryId: delivery._id, status });
    notifyUser(delivery.ngoId, "delivery-status-update", { deliveryId: delivery._id, status });
    notifyDeliveryRoom(delivery._id, "delivery-status-update", { deliveryId: delivery._id, status });

    return success(res, 200, `Delivery marked as ${status}`, delivery);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get single delivery details (for tracking)
// @route   GET /api/deliveries/:id
// @access  Private (donor, ngo, or volunteer involved)
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("donorId", "name organizationName phone address")
      .populate("ngoId", "name organizationName phone address")
      .populate("volunteerId", "name phone")
      .populate("foodId", "foodName quantity quantityUnit image");

    if (!delivery) {
      return error(res, 404, "Delivery not found");
    }

    const involvedIds = [
      delivery.donorId._id.toString(),
      delivery.ngoId._id.toString(),
      delivery.volunteerId ? delivery.volunteerId._id.toString() : null,
    ];

    if (!involvedIds.includes(req.user.id) && req.user.role !== "admin") {
      return error(res, 403, "Not authorized to view this delivery");
    }

    return success(res, 200, "Delivery fetched", delivery);
  } catch (err) {
    return error(res, 500, err.message);
  }
};