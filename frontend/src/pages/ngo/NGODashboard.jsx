import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getNearbyFoods } from "../../services/food.service";
import { getMyClaims } from "../../services/claim.service";
import NearbyFoodList from "../../components/ngo/NearbyFoodList";
import ClaimCard from "../../components/ngo/Claimcard";
import ThemeToggle from "../../components/common/ThemeToggle";
import NotificationBell from "../../components/common/NotificationBell";


const NGODashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [foods, setFoods] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(10);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await getNearbyFoods(distance);
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await getMyClaims();
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "browse") fetchFoods();
    if (activeTab === "claims") fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, distance]);

  const handleClaimed = () => {
    fetchFoods();
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>NGO Dashboard</h2>
        <div>
            <ThemeToggle />
            <NotificationBell />
            <span> Welcome, {user?.name} </span>
            <button onClick={logout}>Logout</button>
        </div>
      </div>

      <Link to="/leaderboard">🏆 View Leaderboard</Link>

      {!user?.isVerified && (
        <p style={{ color: "orange" }}>
          Your account is pending admin verification. You won't see nearby food listings until
          an admin verifies your NGO.
        </p>
      )}

      <div style={{ marginBottom: 16, marginTop: 16 }}>
        <button onClick={() => setActiveTab("browse")} disabled={activeTab === "browse"}>
          Browse Nearby Food
        </button>
        <button onClick={() => setActiveTab("claims")} disabled={activeTab === "claims"}>
          My Claims
        </button>
      </div>

      {activeTab === "browse" && (
        <>
          <label>
            Search radius:{" "}
            <select value={distance} onChange={(e) => setDistance(Number(e.target.value))}>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </label>
          <NearbyFoodList foods={foods} onClaimed={handleClaimed} loading={loading} />
        </>
      )}

      {activeTab === "claims" && (
        <div>
          <h3>My Claim History</h3>
          {loading ? (
            <p>Loading claims...</p>
          ) : claims.length === 0 ? (
            <p>You haven't claimed any food yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {claims.map((claim) => (
                <ClaimCard key={claim._id} claim={claim} onChanged={fetchClaims} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NGODashboard;