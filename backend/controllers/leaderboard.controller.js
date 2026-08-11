const Food = require("../models/Food.model");
const Delivery = require("../models/Delivery.model");
const { success, error } = require("../utils/apiResponse");

// @desc    Top donors by total meals donated (completed only)
// @route   GET /api/leaderboard/donors
// @access  Private
exports.getTopDonors = async (req, res) => {
  try {
    const results = await Food.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$donorId",
          totalMeals: { $sum: "$quantity" },
          totalDonations: { $sum: 1 },
        },
      },
      { $sort: { totalMeals: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donor",
        },
      },
      { $unwind: "$donor" },
      {
        $project: {
          totalMeals: 1,
          totalDonations: 1,
          "donor.name": 1,
          "donor.organizationName": 1,
          "donor.donorType": 1,
        },
      },
    ]);

    return success(res, 200, "Top donors fetched", results);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Top volunteers by completed deliveries
// @route   GET /api/leaderboard/volunteers
// @access  Private
exports.getTopVolunteers = async (req, res) => {
  try {
    const results = await Delivery.aggregate([
      { $match: { status: "completed", volunteerId: { $ne: null } } },
      {
        $group: {
          _id: "$volunteerId",
          totalDeliveries: { $sum: 1 },
        },
      },
      { $sort: { totalDeliveries: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "volunteer",
        },
      },
      { $unwind: "$volunteer" },
      {
        $project: {
          totalDeliveries: 1,
          "volunteer.name": 1,
        },
      },
    ]);

    return success(res, 200, "Top volunteers fetched", results);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Top NGOs by total food claimed
// @route   GET /api/leaderboard/ngos
// @access  Private
exports.getTopNGOs = async (req, res) => {
  try {
    const Claim = require("../models/Claim.model");

    const results = await Claim.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "foods",
          localField: "foodId",
          foreignField: "_id",
          as: "food",
        },
      },
      { $unwind: "$food" },
      {
        $group: {
          _id: "$ngoId",
          totalClaims: { $sum: 1 },
          totalMealsReceived: { $sum: "$food.quantity" },
        },
      },
      { $sort: { totalMealsReceived: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "ngo",
        },
      },
      { $unwind: "$ngo" },
      {
        $project: {
          totalClaims: 1,
          totalMealsReceived: 1,
          "ngo.name": 1,
          "ngo.organizationName": 1,
        },
      },
    ]);

    return success(res, 200, "Top NGOs fetched", results);
  } catch (err) {
    return error(res, 500, err.message);
  }
};