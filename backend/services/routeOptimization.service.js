// Route optimization using OSRM (Open Source Routing Machine) — free, no API key needed.
// Falls back to straight-line (haversine) distance estimate if OSRM is unreachable.

const https = require("https");

// Haversine formula — straight-line distance in km between two [lng, lat] points
const haversineDistance = (coord1, coord2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Fetch route from OSRM public demo server
const fetchOSRMRoute = (pickupCoords, dropCoords) => {
  return new Promise((resolve, reject) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords[0]},${pickupCoords[1]};${dropCoords[0]},${dropCoords[1]}?overview=full&geometries=geojson`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.code === "Ok" && parsed.routes?.length > 0) {
              resolve(parsed.routes[0]);
            } else {
              reject(new Error("No route found from OSRM"));
            }
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
};

// @param pickupCoords [longitude, latitude]
// @param dropCoords [longitude, latitude]
const getOptimizedRoute = async (pickupCoords, dropCoords) => {
  try {
    const route = await fetchOSRMRoute(pickupCoords, dropCoords);

    return {
      source: "osrm",
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      estimatedMinutes: Math.round(route.duration / 60),
      routeCoordinates: route.geometry.coordinates, // array of [lng, lat] points for the path
    };
  } catch (err) {
    // Fallback: straight-line estimate if OSRM is down/unreachable
    const distanceKm = Math.round(haversineDistance(pickupCoords, dropCoords) * 10) / 10;
    const estimatedMinutes = Math.round((distanceKm / 25) * 60); // assume avg 25 km/h city speed

    return {
      source: "fallback_estimate",
      distanceKm,
      estimatedMinutes,
      routeCoordinates: [pickupCoords, dropCoords], // straight line only
      note: "Live routing service unavailable — showing straight-line estimate",
    };
  }
};

module.exports = { getOptimizedRoute, haversineDistance };