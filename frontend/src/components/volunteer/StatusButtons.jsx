import { useState } from "react";
import { updateDeliveryStatus } from "../../services/delivery.service";

// Maps current status -> the next status a volunteer can move it to
const nextStatusMap = {
  assigned: "picked_up",
  picked_up: "delivered",
  delivered: "completed",
};

const buttonLabels = {
  picked_up: "Mark as Picked Up",
  delivered: "Mark as Delivered",
  completed: "Mark as Completed",
};

const StatusButtons = ({ delivery, onChanged }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextStatus = nextStatusMap[delivery.status];

  if (!nextStatus) {
    return null; // completed or cancelled — nothing to do
  }

  const handleUpdate = async () => {
    setError("");
    setLoading(true);
    try {
      await updateDeliveryStatus(delivery._id, nextStatus);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? "Updating..." : buttonLabels[nextStatus]}
      </button>
    </div>
  );
};

export default StatusButtons;