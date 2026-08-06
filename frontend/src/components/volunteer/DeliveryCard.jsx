import { useState } from "react";
import StatusButtons from "./StatusButtons";

const statusColors = {
  pending_assignment: "gray",
  assigned: "orange",
  picked_up: "blue",
  delivered: "purple",
  completed: "green",
  cancelled: "red",
};

const DeliveryCard = ({ delivery, onChanged }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4>{delivery.foodId?.foodName}</h4>
        <span style={{ color: statusColors[delivery.status] || "black", fontWeight: "bold" }}>
          {delivery.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <p>
        {delivery.foodId?.quantity} {delivery.foodId?.quantityUnit}
      </p>

      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
        <div>
          <strong>Pickup:</strong>
          <p>{delivery.pickupAddress}</p>
          <p>{delivery.donorId?.organizationName || delivery.donorId?.name}</p>
          <p>📞 {delivery.donorId?.phone}</p>
        </div>
        <div>
          <strong>Drop:</strong>
          <p>{delivery.dropAddress}</p>
          <p>{delivery.ngoId?.organizationName || delivery.ngoId?.name}</p>
          <p>📞 {delivery.ngoId?.phone}</p>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 8 }}>
        {expanded ? "Hide" : "View"} Details
      </button>

      {expanded && (
        <div style={{ marginTop: 8, fontSize: 14, color: "#555" }}>
          <p>Assigned at: {delivery.assignedAt ? new Date(delivery.assignedAt).toLocaleString() : "—"}</p>
          <p>Picked up at: {delivery.pickedUpAt ? new Date(delivery.pickedUpAt).toLocaleString() : "—"}</p>
          <p>Delivered at: {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString() : "—"}</p>
          <p>Completed at: {delivery.completedAt ? new Date(delivery.completedAt).toLocaleString() : "—"}</p>
        </div>
      )}
      <a href={`/delivery/${claim.deliveryId}/track`} target="_blank" rel="noreferrer">
  Track Delivery
</a>

      <StatusButtons delivery={delivery} onChanged={onChanged} />
    </div>
  );
};

export default DeliveryCard;