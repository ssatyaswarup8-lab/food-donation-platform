import { useState } from "react";
import { claimFood } from "../../services/claim.service";

const NearbyFoodList = ({ foods, onClaimed, loading }) => {
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState("");

  const handleClaim = async (foodId) => {
    setError("");
    setClaimingId(foodId);
    try {
      await claimFood(foodId);
      onClaimed();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to claim food");
    } finally {
      setClaimingId(null);
    }
  };

  const getUrgencyLabel = (expiresAt) => {
    const hoursLeft = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60);
    if (hoursLeft <= 0) return { text: "Expired", color: "red" };
    if (hoursLeft < 2) return { text: `Expires in ${Math.round(hoursLeft * 60)} mins`, color: "red" };
    if (hoursLeft < 6) return { text: `Expires in ${Math.round(hoursLeft)} hrs`, color: "orange" };
    return { text: `Expires in ${Math.round(hoursLeft)} hrs`, color: "green" };
  };

  if (loading) return <p>Loading nearby food...</p>;

  if (!foods || foods.length === 0) {
    return <p>No available food listings nearby right now. Check back soon.</p>;
  }

  return (
    <div>
      <h3>Nearby Available Food</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {foods.map((food) => {
          const urgency = getUrgencyLabel(food.expiresAt);
          return (
            <div key={food._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4>{food.foodName}</h4>
                <span>{food.distanceInKm?.toFixed(1)} km away</span>
              </div>

              {food.image && (
                <img
                  src={`${import.meta.env.VITE_SOCKET_URL}${food.image}`}
                  alt={food.foodName}
                  style={{ width: 150, height: 100, objectFit: "cover" }}
                />
              )}

              <p>
                {food.quantity} {food.quantityUnit} — {food.foodType}
              </p>
              <p>Pickup: {food.pickupAddress}</p>
              <p>Donor: {food.donor?.organizationName || food.donor?.name}</p>
              <p style={{ color: urgency.color, fontWeight: "bold" }}>{urgency.text}</p>

              <button onClick={() => handleClaim(food._id)} disabled={claimingId === food._id}>
                {claimingId === food._id ? "Claiming..." : "Claim Food"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyFoodList;