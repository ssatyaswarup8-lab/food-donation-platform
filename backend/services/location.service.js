const User = require("../models/User.model");
const Food = require("../models/Food.model");

// Find NGOs near a given [longitude, latitude], within maxDistanceKm
const findNearbyNGOs = async (coordinates, maxDistanceKm = 10) => {
  const ngos = await User.find({
    role: "ngo",
    isVerified: true,
    isActive: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistanceKm * 1000, // meters
      },
    },
  }).select("name organizationName phone address location");

  return ngos;
};

// Find available food near a given NGO's [longitude, latitude], with distance in km
const findNearbyFoods = async (coordinates, maxDistanceKm = 10) => {
  const foods = await Food.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates },
        distanceField: "distanceInMeters",
        maxDistance: maxDistanceKm * 1000,
        spherical: true,
        query: {
          status: "available",
          expiresAt: { $gt: new Date() },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "donorId",
        foreignField: "_id",
        as: "donor",
      },
    },
    { $unwind: "$donor" },
    {
      $project: {
        foodName: 1,
        quantity: 1,
        quantityUnit: 1,
        foodType: 1,
        preparedAt: 1,
        expiresAt: 1,
        image: 1,
        pickupAddress: 1,
        status: 1,
        location: 1,
        createdAt: 1,
        distanceInKm: { $divide: ["$distanceInMeters", 1000] },
        "donor.name": 1,
        "donor.organizationName": 1,
        "donor.phone": 1,
      },
    },
    { $sort: { distanceInKm: 1 } },
  ]);

  return foods;
};

module.exports = { findNearbyNGOs, findNearbyFoods };