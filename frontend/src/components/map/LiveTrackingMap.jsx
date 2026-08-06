import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useSocket } from "../../hooks/useSocket";
import { getOptimizedRoute } from "../../services/ai.service";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

const foodIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const dropIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const volunteerIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [30, 46], iconAnchor: [15, 46] });

const LiveTrackingMap = ({ delivery }) => {
  const socket = useSocket();

  const pickup = delivery.pickupLocation?.coordinates;
  const drop = delivery.dropLocation?.coordinates;

  const [volunteerPos, setVolunteerPos] = useState(
    delivery.volunteerCurrentLocation?.coordinates &&
      delivery.volunteerCurrentLocation.coordinates[0] !== 0
      ? delivery.volunteerCurrentLocation.coordinates
      : pickup
  );

  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);

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
        setVolunteerPos([data.longitude, data.latitude]);
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
  const volunteerLatLng = volunteerPos ? [volunteerPos[1], volunteerPos[0]] : pickupLatLng;

  const centerLat = (pickupLatLng[0] + dropLatLng[0]) / 2;
  const centerLng = (pickupLatLng[1] + dropLatLng[1]) / 2;

  // Convert OSRM's [lng, lat] route points to Leaflet's [lat, lng]
  const routePath = routeInfo?.routeCoordinates?.map(([lng, lat]) => [lat, lng]) || [
    pickupLatLng,
    dropLatLng,
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          padding: 8,
          background: "#f0f7ff",
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        {routeLoading ? (
          <span>Calculating optimal route...</span>
        ) : routeInfo ? (
          <span>
            🚗 Suggested route: <strong>{routeInfo.distanceKm} km</strong> — approx.{" "}
            <strong>{routeInfo.estimatedMinutes} min</strong>
            {routeInfo.note && <span style={{ color: "#888" }}> ({routeInfo.note})</span>}
          </span>
        ) : (
          <span>Route info unavailable</span>
        )}
      </div>

      <MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: 400, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Marker position={pickupLatLng} icon={foodIcon}>
          <Popup>Pickup: {delivery.pickupAddress}</Popup>
        </Marker>

        <Marker position={dropLatLng} icon={dropIcon}>
          <Popup>Drop: {delivery.dropAddress}</Popup>
        </Marker>

        {delivery.status !== "pending_assignment" && (
          <Marker position={volunteerLatLng} icon={volunteerIcon}>
            <Popup>Volunteer's current location</Popup>
          </Marker>
        )}

        <Polyline positions={routePath} color="blue" weight={4} opacity={0.7} />
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;