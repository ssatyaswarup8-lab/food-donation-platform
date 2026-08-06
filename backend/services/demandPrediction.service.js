const Claim = require("../models/Claim.model");
const Food = require("../models/Food.model");
const User = require("../models/User.model");

// Groups historical claims by NGO's area (using their address as a simple area key)
// and scores demand based on: claim frequency, recency, and unmet requests (cancelled claims = signal of high competition/demand).
const predictDemandByArea = async () => {
  const claims = await Claim.find()
    .populate("ngoId", "name organizationName address location")
    .populate("foodId", "quantity foodType");

  if (claims.length === 0) {
    return [];
  }

  const areaStats = {};

  claims.forEach((claim) => {
    if (!claim.ngoId) return;

    // Use address as the area grouping key (simple, no external geocoding needed)
    const area = claim.ngoId.address || "Unknown Area";

    if (!areaStats[area]) {
      areaStats[area] = {
        area,
        totalClaims: 0,
        totalQuantityClaimed: 0,
        cancelledClaims: 0,
        ngoCount: new Set(),
        lastClaimDate: null,
        coordinates: claim.ngoId.location?.coordinates || null,
      };
    }

    const stat = areaStats[area];
    stat.totalClaims += 1;
    stat.totalQuantityClaimed += claim.foodId?.quantity || 0;
    if (claim.status === "cancelled") stat.cancelledClaims += 1;
    stat.ngoCount.add(claim.ngoId._id.toString());

    const claimDate = new Date(claim.claimedAt);
    if (!stat.lastClaimDate || claimDate > stat.lastClaimDate) {
      stat.lastClaimDate = claimDate;
    }
  });

  // Convert to array and calculate a demand score
  const results = Object.values(areaStats).map((stat) => {
    const daysSinceLastClaim = stat.lastClaimDate
      ? (new Date() - stat.lastClaimDate) / (1000 * 60 * 60 * 24)
      : 999;

    // Recency factor: more recent activity = higher current demand signal
    const recencyScore = Math.max(0, 30 - daysSinceLastClaim) / 30; // 0 to 1, decays over 30 days

    // Frequency factor: more claims = more consistent demand
    const frequencyScore = Math.min(stat.totalClaims / 10, 1); // caps at 10+ claims

    // Cancellation rate signals unmet/competitive demand (claimed but fell through)
    const cancellationRate = stat.totalClaims > 0 ? stat.cancelledClaims / stat.totalClaims : 0;

    const demandScore = (recencyScore * 0.4 + frequencyScore * 0.4 + cancellationRate * 0.2) * 100;

    return {
      area: stat.area,
      demandScore: Math.round(demandScore),
      totalClaims: stat.totalClaims,
      totalQuantityClaimed: stat.totalQuantityClaimed,
      activeNGOs: stat.ngoCount.size,
      daysSinceLastClaim: Math.round(daysSinceLastClaim),
      coordinates: stat.coordinates,
    };
  });

  // Sort by highest demand first
  results.sort((a, b) => b.demandScore - a.demandScore);

  return results;
};

// Simple label for UI display
const getDemandLabel = (score) => {
  if (score >= 70) return "Very High";
  if (score >= 50) return "High";
  if (score >= 30) return "Moderate";
  return "Low";
};

module.exports = { predictDemandByArea, getDemandLabel };