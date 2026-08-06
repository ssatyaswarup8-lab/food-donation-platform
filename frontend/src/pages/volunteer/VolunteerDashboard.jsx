import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getMyDeliveries } from "../../services/delivery.service";
import DeliveryCard from "../../components/volunteer/DeliveryCard";
import { useSocket } from "../../hooks/useSocket";

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // active | completed | all

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await getMyDeliveries();
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  fetchDeliveries();
}, []);

// 👇 ADD THE LIVE LOCATION useEffect HERE
useEffect(() => {
  if (!socket) return;

  const activeDelivery = deliveries.find((d) =>
    ["assigned", "picked_up"].includes(d.status)
  );

  if (!activeDelivery || !navigator.geolocation) return;

  const sendLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      socket.emit("volunteer-location-update", {
        deliveryId: activeDelivery._id,
        longitude: pos.coords.longitude,
        latitude: pos.coords.latitude,
      });
    });
  };

  sendLocation();
  const interval = setInterval(sendLocation, 10000);

  return () => clearInterval(interval);
}, [socket, deliveries]);


  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === "active") return !["completed", "cancelled"].includes(d.status);
    if (filter === "completed") return d.status === "completed";
    return true;
  });

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Volunteer Dashboard</h2>
        <div>
          <span>Welcome, {user?.name} </span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {!user?.isVerified && (
        <p style={{ color: "orange" }}>
          Your account is pending admin verification. You won't be assigned deliveries until
          verified.
        </p>
      )}

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setFilter("active")} disabled={filter === "active"}>
          Active
        </button>
        <button onClick={() => setFilter("completed")} disabled={filter === "completed"}>
          Completed
        </button>
        <button onClick={() => setFilter("all")} disabled={filter === "all"}>
          All
        </button>
        <button onClick={fetchDeliveries} style={{ marginLeft: 10 }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading deliveries...</p>
      ) : filteredDeliveries.length === 0 ? (
        <p>No deliveries to show in this view.</p>
      ) : (
        filteredDeliveries.map((delivery) => (
          <DeliveryCard key={delivery._id} delivery={delivery} onChanged={fetchDeliveries} />
        ))
      )}
    </div>
  );
};

export default VolunteerDashboard;