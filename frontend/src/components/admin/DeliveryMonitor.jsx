import { useState, useEffect } from "react";
import { getAllDeliveriesAdmin, assignVolunteer } from "../../services/admin.service";

const statusColors = {
  pending_assignment: "gray",
  assigned: "orange",
  picked_up: "blue",
  delivered: "purple",
  completed: "green",
  cancelled: "red",
};

const DeliveryMonitor = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await getAllDeliveriesAdmin(statusFilter);
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleAssign = async (deliveryId) => {
    setAssigningId(deliveryId);
    try {
      await assignVolunteer(deliveryId);
      fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign volunteer");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div>
      <h3>Delivery Monitoring</h3>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="pending_assignment">Pending Assignment</option>
        <option value="assigned">Assigned</option>
        <option value="picked_up">Picked Up</option>
        <option value="delivered">Delivered</option>
        <option value="completed">Completed</option>
      </select>

      {loading ? (
        <p>Loading deliveries...</p>
      ) : deliveries.length === 0 ? (
        <p>No deliveries found for this filter.</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {deliveries.map((d) => (
            <div key={d._id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{d.foodId?.foodName}</strong>
                <span style={{ color: statusColors[d.status], fontWeight: "bold" }}>
                  {d.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <p>Donor: {d.donorId?.organizationName || d.donorId?.name}</p>
              <p>NGO: {d.ngoId?.organizationName || d.ngoId?.name}</p>
              <p>Volunteer: {d.volunteerId ? d.volunteerId.name : "Not assigned yet"}</p>

              {d.status === "pending_assignment" && (
                <button onClick={() => handleAssign(d._id)} disabled={assigningId === d._id}>
                  {assigningId === d._id ? "Assigning..." : "Assign Volunteer"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryMonitor;