const Food = require("../models/Food.model");
const User = require("../models/User.model");
const { success, error } = require("../utils/apiResponse");
const { findNearbyFoods, findNearbyNGOs } = require("../services/location.service");
const { broadcastEvent } = require("../services/notification.service");

// @desc    Donor posts surplus food
// @route   POST /api/foods
// @access  Private (donor only)
exports.createFood = async (req, res) => {
  try {
    const {
      foodName,
      quantity,
      quantityUnit,
      foodType,
      description,
      preparedAt,
      expiresAt,
      pickupAddress,
      longitude,
      latitude,
    } = req.body;

    if (!foodName || !quantity || !foodType || !preparedAt || !expiresAt || !pickupAddress) {
      return error(res, 400, "Please provide all required fields");
    }

    if (new Date(expiresAt) <= new Date(preparedAt)) {
      return error(res, 400, "Expiry time must be after prepared time");
    }

    if (!longitude || !latitude) {
      return error(res, 400, "Pickup location coordinates are required");
    }

    const food = await Food.create({
      foodName,
      quantity,
      quantityUnit,
      foodType,
      description,
      preparedAt,
      expiresAt,
      pickupAddress,
      donorId: req.user.id,
      image: req.files && req.files[0] ? `/uploads/${req.files[0].filename}` : "",
      images: req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [],
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });
    broadcastEvent("new-food-posted", {
  foodId: food._id,
  foodName: food.foodName,
  quantity: food.quantity,
  pickupAddress: food.pickupAddress,
  expiresAt: food.expiresAt,
});

    return success(res, 201, "Food listed successfully", food);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get all available food listings (for NGOs to browse)
// @route   GET /api/foods
// @access  Private
exports.getAllFoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: "available", expiresAt: { $gt: new Date() } };

    const [foods, total] = await Promise.all([
      Food.find(filter)
        .populate("donorId", "name organizationName phone address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Food.countDocuments(filter),
    ]);

    return success(res, 200, "Foods fetched successfully", {
      foods,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};
// @desc    Get single food listing
// @route   GET /api/foods/:id
// @access  Private
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      "donorId",
      "name organizationName phone address"
    );

    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    return success(res, 200, "Food fetched successfully", food);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get logged-in donor's own food listings
// @route   GET /api/foods/my-listings
// @access  Private (donor only)
exports.getMyFoods = async (req, res) => {
  try {
    const foods = await Food.find({ donorId: req.user.id }).sort({ createdAt: -1 });
    return success(res, 200, "Your food listings fetched", foods);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Update food listing (only if still available)
// @route   PUT /api/foods/:id
// @access  Private (donor who owns it)
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    if (food.donorId.toString() !== req.user.id) {
      return error(res, 403, "Not authorized to update this listing");
    }

    if (food.status !== "available") {
      return error(res, 400, "Cannot update a listing that has already been claimed");
    }

    const allowedUpdates = [
      "foodName",
      "quantity",
      "quantityUnit",
      "foodType",
      "description",
      "preparedAt",
      "expiresAt",
      "pickupAddress",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        food[field] = req.body[field];
      }
    });

    if (req.file) {
      food.image = `/uploads/${req.file.filename}`;
    }

    await food.save();

    return success(res, 200, "Food listing updated", food);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Delete/cancel food listing
// @route   DELETE /api/foods/:id
// @access  Private (donor who owns it)
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    if (food.donorId.toString() !== req.user.id) {
      return error(res, 403, "Not authorized to delete this listing");
    }

    if (food.status !== "available") {
      return error(res, 400, "Cannot delete a listing that has already been claimed");
    }

    await food.deleteOne();

    return success(res, 200, "Food listing deleted");
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get food listings near the logged-in NGO's location
// @route   GET /api/foods/nearby?distance=10
// @access  Private (ngo only)
exports.getNearbyFoods = async (req, res) => {
  try {
    
    const ngo = await User.findById(req.user.id);

    if (!ngo || !ngo.location || !ngo.location.coordinates) {
      return error(res, 400, "NGO location not set. Please update your profile.");
    }

    const maxDistanceKm = req.query.distance ? parseFloat(req.query.distance) : 10;

    const foods = await findNearbyFoods(ngo.location.coordinates, maxDistanceKm);

    return success(res, 200, "Nearby food listings fetched", foods);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get NGOs near a food listing (used internally / by donor to see who'll be notified)
// @route   GET /api/foods/:id/nearby-ngos
// @access  Private (donor who owns the listing)
exports.getNearbyNGOsForFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return error(res, 404, "Food listing not found");
    }

    if (food.donorId.toString() !== req.user.id) {
      return error(res, 403, "Not authorized to view this");
    }

    const maxDistanceKm = req.query.distance ? parseFloat(req.query.distance) : 10;
    const ngos = await findNearbyNGOs(food.location.coordinates, maxDistanceKm);

    return success(res, 200, "Nearby NGOs fetched", ngos);
  } catch (err) {
    return error(res, 500, err.message);
  }
};