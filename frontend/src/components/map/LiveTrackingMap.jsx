import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useSocket } from "../../hooks/useSocket";
import { useSmoothMarker } from "../../hooks/useSmoothMarker";
import { calculateBearing, distanceKm } from "../../utils/geo";
import { getOptimizedRoute } from "../../services/ai.service";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

const foodIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const dropIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

// Uber-style rotating vehicle icon (a car emoji rendered as a divIcon, rotated to face travel direction)
const createVolunteerIcon = (bearing) =>
  L.divIcon({
    className: "",
    html: `<div style="
      transform: rotate(${bearing}deg);
      transition: transform 0.5s ease;
      font-size: 26px;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
    ">🛵</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

// Recenters/follows the moving marker automatically, like Uber's live-follow camera
const FollowMarker = ({ position, follow }) => {
  const map = useMap();
  useEffect(() => {
    if (follow && position) {
      map.panTo([position[1], position[0]], { animate: true, duration: 0.8 });
    }
  }, [position, follow, map]);
  return null;
};

const LiveTrackingMap = ({ delivery }) => {
  const socket = useSocket();

  const pickup = delivery.pickupLocation?.coordinates;
  const drop = delivery.dropLocation?.coordinates;

  const initialVolunteerCoords =
    delivery.volunteerCurrentLocation?.coordinates &&
    delivery.volunteerCurrentLocation.coordinates[0] !== 0
      ? delivery.volunteerCurrentLocation.coordinates
      : pickup;

  const [rawVolunteerPos, setRawVolunteerPos] = useState(initialVolunteerCoords);
  const prevPosRef = useRef(initialVolunteerCoords);
  const [bearing, setBearing] = useState(0);
  const [follow, setFollow] = useState(true);

  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);

  // Smoothly glide the marker between GPS pings instead of jumping (Uber-style)
  const animatedVolunteerPos = useSmoothMarker(rawVolunteerPos, 2000);

  useEffect(() => {
    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const res = await getOptimizedRoute(delivery._id);
        setRouteInfo(res.data);
      } catch (err) {
        console.error("Route fetch failed:", err.message);
      } finally {
        setRouteLoading(false);
      }
    };
    fetchRoute();
  }, [delivery._id]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("track-delivery", delivery._id);

    const handleLocationUpdate = (data) => {
      if (data.deliveryId === delivery._id) {
        const newPos = [data.longitude, data.latitude];

        if (prevPosRef.current) {
          const newBearing = calculateBearing(prevPosRef.current, newPos);
          setBearing(newBearing);
        }
        prevPosRef.current = newPos;
        setRawVolunteerPos(newPos);
      }
    };

    socket.on("volunteer-location", handleLocationUpdate);
    return () => socket.off("volunteer-location", handleLocationUpdate);
  }, [socket, delivery._id]);

  if (!pickup || !drop) {
    return <p>Location data not available for this delivery.</p>;
  }

  const pickupLatLng = [pickup[1], pickup[0]];
  const dropLatLng = [drop[1], drop[0]];
  const volunteerLatLng = animatedVolunteerPos
    ? [animatedVolunteerPos[1], animatedVolunteerPos[0]]
    : pickupLatLng;

  const centerLat = (pickupLatLng[0] + dropLatLng[0]) / 2;
  const centerLng = (pickupLatLng[1] + dropLatLng[1]) / 2;

  const routePath = routeInfo?.routeCoordinates?.map(([lng, lat]) => [lat, lng]) || [
    pickupLatLng,
    dropLatLng,
  ];

  // Live "distance remaining" from volunteer's current spot to the drop point
  const remainingKm =
    delivery.status === "picked_up" && animatedVolunteerPos
      ? distanceKm(animatedVolunteerPos, drop).toFixed(1)
      : delivery.status === "assigned" && animatedVolunteerPos
      ? distanceKm(animatedVolunteerPos, pickup).toFixed(1)
      : null;

  const etaMinutes = remainingKm ? Math.max(1, Math.round((remainingKm / 22) * 60)) : null; // ~22km/h avg city bike speed

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          padding: 10,
          background: "var(--primary-green-light)",
          borderRadius: 8,
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          {routeLoading ? (
            <span>Calculating route...</span>
          ) : etaMinutes ? (
            <span>
              🛵{" "}
              <strong>
                {delivery.status === "assigned" ? "Arriving at pickup" : "Arriving at drop"} in ~
                {etaMinutes} min
              </strong>{" "}
              <span style={{ color: "var(--text-muted)" }}>({remainingKm} km away)</span>
            </span>
          ) : routeInfo ? (
            <span>
              🚗 Route: <strong>{routeInfo.distanceKm} km</strong> — approx.{" "}
              <strong>{routeInfo.estimatedMinutes} min</strong>
            </span>
          ) : (
            <span>Route info unavailable</span>
          )}
        </div>

        <button
          className="btn-outline"
          style={{ fontSize: 12, padding: "4px 10px" }}
          onClick={() => setFollow((f) => !f)}
        >
          {follow ? "📍 Following" : "📍 Follow Off"}
        </button>
      </div>

      <MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: 420, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={pickupLatLng} icon={foodIcon}>
          <Popup>Pickup: {delivery.pickupAddress}</Popup>
        </Marker>

        <Marker position={dropLatLng} icon={dropIcon}>
          <Popup>Drop: {delivery.dropAddress}</Popup>
        </Marker>

        {delivery.status !== "pending_assignment" && (
          <>
            <Marker position={volunteerLatLng} icon={createVolunteerIcon(bearing)}>
              <Popup>Volunteer's current location</Popup>
            </Marker>
            <FollowMarker position={animatedVolunteerPos} follow={follow} />
          </>
        )}

        <Polyline positions={routePath} color="#2e7d32" weight={4} opacity={0.75} />
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;