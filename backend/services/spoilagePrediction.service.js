// Rule-based spoilage prediction model.
// Based on general food safety guidelines (USDA "danger zone" principles):
// Bacteria grow fastest between 4°C - 60°C (40°F - 140°F).
// Higher temperature + longer time since prep = faster spoilage.

const baseSafeHoursByType = {
  veg: 6,
  "non-veg": 4,
  mixed: 5,
  dairy: 3,
  rice: 5,
  gravy: 4,
};

const getTemperatureFactor = (temperature) => {
  // temperature in Celsius
  if (temperature <= 5) return 3;      // refrigerated — much safer
  if (temperature <= 20) return 1.5;   // room temp, cool weather
  if (temperature <= 30) return 1;     // normal room temp
  if (temperature <= 40) return 0.6;   // warm/hot weather — danger zone
  return 0.3;                          // very hot — spoils fast
};

const predictSpoilage = ({ foodType, temperature, hoursSincePrepared }) => {
  const baseHours = baseSafeHoursByType[foodType?.toLowerCase()] || 5;
  const tempFactor = getTemperatureFactor(Number(temperature));

  const totalSafeHours = baseHours * tempFactor;
  const remainingHours = totalSafeHours - Number(hoursSincePrepared);

  const safeHoursLeft = Math.max(0, Math.round(remainingHours * 10) / 10);

  let riskLevel = "safe";
  if (safeHoursLeft <= 0) riskLevel = "expired";
  else if (safeHoursLeft < 1) riskLevel = "critical";
  else if (safeHoursLeft < 3) riskLevel = "caution";

  return {
    safeHoursLeft,
    riskLevel,
    recommendation: getRecommendation(riskLevel, safeHoursLeft),
  };
};

const getRecommendation = (riskLevel, hoursLeft) => {
  switch (riskLevel) {
    case "expired":
      return "This food is no longer safe to distribute. Please discard it.";
    case "critical":
      return `Less than 1 hour of safety remains (${hoursLeft}h). Prioritize immediate pickup and distribution.`;
    case "caution":
      return `Only ${hoursLeft} hours left. Arrange pickup as soon as possible.`;
    default:
      return `Food is safe for approximately ${hoursLeft} more hours. Normal pickup timing is fine.`;
  }
};

module.exports = { predictSpoilage };