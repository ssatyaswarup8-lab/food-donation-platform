import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDeliveryById } from "../services/delivery.service";
import LiveTrackingMap from "../components/map/LiveTrackingMap";
import ChatBox from "../components/common/ChatBox";
import DeliveryStatusTimeline from "../components/tracking/DeliveryStatusTimeline";

const statusText = {
  pending_assignment: "Looking for a nearby volunteer...",
  assigned: "Volunteer is heading to pickup",
  picked_up: "Food picked up — on the way to you",
  delivered: "Delivered! Awaiting confirmation",
  completed: "Delivery completed",
};

const DeliveryTracking = () => {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDelivery = async () => {
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
    const interval = setInterval(fetchDelivery, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading delivery...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!delivery) return null;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Track Delivery</h2>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>{delivery.foodId?.foodName}</strong>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
              {statusText[delivery.status]}
            </p>
          </div>
          {delivery.volunteerId && (
            <div style={{ textAlign: "right", fontSize: 13 }}>
              <div>{delivery.volunteerId.name}</div>
              <div style={{ color: "var(--text-muted)" }}>📞 {delivery.volunteerId.phone}</div>
            </div>
          )}
        </div>

        <DeliveryStatusTimeline currentStatus={delivery.status} />
      </div>

      <LiveTrackingMap delivery={delivery} />

      <ChatBox deliveryId={delivery._id} />
    </div>
  );
};

export default DeliveryTracking;