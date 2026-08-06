import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDeliveryById } from "../services/delivery.service";
import LiveTrackingMap from "../components/map/LiveTrackingMap";

const DeliveryTracking = () => {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const res = await getDeliveryById(id);
      setDelivery(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load delivery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
    const interval = setInterval(fetchDelivery, 15000); // refresh status every 15s as backup
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading delivery...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!delivery) return null;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Track Delivery</h2>
      <p>
        <strong>{delivery.foodId?.foodName}</strong> — Status:{" "}
        <span style={{ fontWeight: "bold" }}>{delivery.status.replace("_", " ").toUpperCase()}</span>
      </p>
      <p>
        Volunteer: {delivery.volunteerId ? `${delivery.volunteerId.name} (📞 ${delivery.volunteerId.phone})` : "Not assigned yet"}
      </p>

      <LiveTrackingMap delivery={delivery} />
    </div>
  );
};

export default DeliveryTracking;