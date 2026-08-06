const { predictSpoilage } = require("../services/spoilagePrediction.service");
const { success, error } = require("../utils/apiResponse");
const { predictDemandByArea, getDemandLabel } = require("../services/demandPrediction.service");
const { getOptimizedRoute } = require("../services/routeOptimization.service");
const Delivery = require("../models/Delivery.model");

// @desc    Predict how many hours food remains safe to eat
// @route   POST /api/ai/spoilage-prediction
// @access  Private (donor)
exports.getSpoilagePrediction = async (req, res) => {
  try {
    const { foodType, temperature, preparedAt } = req.body;

    if (!foodType || temperature === undefined || !preparedAt) {
      return error(res, 400, "Please provide foodType, temperature, and preparedAt");
    }

    const hoursSincePrepared = (new Date() - new Date(preparedAt)) / (1000 * 60 * 60);

    if (hoursSincePrepared < 0) {
      return error(res, 400, "preparedAt cannot be in the future");
    }

    const result = predictSpoilage({
      foodType,
      temperature,
      hoursSincePrepared: hoursSincePrepared.toFixed(2),
    });

    return success(res, 200, "Spoilage prediction calculated", {
      ...result,
      hoursSincePrepared: Math.round(hoursSincePrepared * 10) / 10,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Predict which areas need food most, based on historical claim data
// @route   GET /api/ai/demand-prediction
// @access  Private (admin, donor)
exports.getDemandPrediction = async (req, res) => {
  try {
    const results = await predictDemandByArea();

    const withLabels = results.map((r) => ({
      ...r,
      demandLabel: getDemandLabel(r.demandScore),
    }));

    return success(res, 200, "Demand prediction calculated", withLabels);
  } catch (err) {
    return error(res, 500, err.message);
  }
};
// @desc    Get optimized route (distance, time, path) for a delivery
// @route   GET /api/ai/route-optimization/:deliveryId
// @access  Private (donor, ngo, volunteer, admin involved in the delivery)
exports.getRouteForDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);

    if (!delivery) {
      return error(res, 404, "Delivery not found");
    }

    const involvedIds = [
      delivery.donorId.toString(),
      delivery.ngoId.toString(),
      delivery.volunteerId ? delivery.volunteerId.toString() : null,
    ];

    if (!involvedIds.includes(req.user.id) && req.user.role !== "admin") {
      return error(res, 403, "Not authorized to view this route");
    }

    const route = await getOptimizedRoute(
      delivery.pickupLocation.coordinates,
      delivery.dropLocation.coordinates
    );

    return success(res, 200, "Optimized route calculated", route);
  } catch (err) {
    return error(res, 500, err.message);
  }
};