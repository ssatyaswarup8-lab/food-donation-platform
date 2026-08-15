import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getMyDeliveries } from "../../services/delivery.service";
import DeliveryCard from "../../components/volunteer/DeliveryCard";
import { SkeletonCard } from "../../components/common/Skeleton";
import DashboardHeader from "../../components/common/DashboardHeader";
import StatBadge from "../../components/common/StatBadge";
import EmptyState from "../../components/common/EmptyState";
import InfoTipCard from "../../components/common/InfoTipCard";
import { staggerStyle } from "../../utils/stagger";

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

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

  useEffect(() => {
    if (!socket) return;

    const activeDelivery = deliveries.find((d) => ["assigned", "picked_up"].includes(d.status));
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

  const stats = useMemo(() => {
    const completed = deliveries.filter((d) => d.status === "completed").length;
    const active = deliveries.filter((d) => ["assigned", "picked_up"].includes(d.status)).length;
    const totalMeals = deliveries
      .filter((d) => d.status === "completed")
      .reduce((sum, d) => sum + (d.foodId?.quantity || 0), 0);

    return { completed, active, totalMeals };
  }, [deliveries]);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === "active") return !["completed", "cancelled"].includes(d.status);
    if (filter === "completed") return d.status === "completed";
    return true;
  });

  return (
    <div className="page-fade-in" style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <DashboardHeader
        icon="🛵"
        title={`Welcome, ${user?.name}`}
        subtitle="Pick up and deliver food — every trip saves a meal"
        gradient="linear-gradient(135deg, #ff8f00, #e65100)"
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <Link to="/leaderboard">🏆 Leaderboard</Link>
        <Link to="/profile">👤 Profile</Link>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="stat-row">
        <StatBadge icon="🚴" label="Active Deliveries" value={stats.active} color="var(--accent-orange)" />
        <StatBadge icon="✅" label="Completed" value={stats.completed} />
        <StatBadge icon="🍽️" label="Meals Delivered" value={stats.totalMeals} color="var(--primary-green)" />
      </div>

      {!user?.isVerified && (
        <p style={{ color: "var(--warning)", background: "#fff3e0", padding: "10px 14px", borderRadius: 8, fontSize: 14 }}>
          ⏳ Your account is pending admin verification. You won't be assigned deliveries until verified.
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
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : filteredDeliveries.length === 0 ? (
        <>
          <EmptyState
            icon={filter === "completed" ? "🎉" : "🛵"}
            title={
              filter === "completed"
                ? "No completed deliveries yet"
                : "No deliveries assigned right now"
            }
            subtitle={
              filter === "completed"
                ? "Once you complete a delivery, it'll show up here with your impact stats."
                : "Sit tight — an admin will assign you a nearby pickup as soon as one's available. Make sure your account is verified and location access is enabled."
            }
          />

          <InfoTipCard
            icon="💡"
            title="While you wait"
            tips={[
              "Keep location access enabled so you get matched to the nearest pickup.",
              "Check your Profile to make sure your address and phone number are up to date.",
              "Once assigned, you'll get a real-time notification and live map tracking.",
              "Completed deliveries earn you a spot on the Leaderboard 🏆",
            ]}
          />
        </>
      ) : (
        filteredDeliveries.map((delivery, idx) => (
          <div key={delivery._id} className="stagger-item" style={staggerStyle(idx)}>
            <DeliveryCard delivery={delivery} onChanged={fetchDeliveries} />
          </div>
        ))
      )}
    </div>
  );
};

export default VolunteerDashboard;