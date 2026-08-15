import { useState, useMemo } from "react";
import { claimFood } from "../../services/claim.service";
import toast from "react-hot-toast";
import { SkeletonCard } from "../common/Skeleton";
import RatingBadge from "../common/RatingBadge";
import { useDebounce } from "../../hooks/useDebounce";
import EmptyState from "../common/EmptyState";

const NearbyFoodList = ({ foods, onClaimed, loading }) => {
  const [claimingId, setClaimingId] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);  
  const [foodTypeFilter, setFoodTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("distance");

 const handleClaim = async (foodId) => {
  setClaimingId(foodId);
  try {
    await claimFood(foodId);
    toast.success("Food claimed successfully!");
    onClaimed();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to claim food");
    onClaimed(); // re-sync in case of race condition
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

  const filteredFoods = useMemo(() => {
    let result = [...(foods || [])];

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((f) => f.foodName.toLowerCase().includes(term));
    }

    if (foodTypeFilter) {
      result = result.filter((f) => f.foodType === foodTypeFilter);
    }

    if (sortBy === "distance") {
      result.sort((a, b) => (a.distanceInKm || 0) - (b.distanceInKm || 0));
    } else if (sortBy === "expiry") {
      result.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
    } else if (sortBy === "quantity") {
      result.sort((a, b) => b.quantity - a.quantity);
    }

    return result;
}, [foods, debouncedSearch, foodTypeFilter, sortBy]);

  if (loading) {
    return (
      <div>
        <h3>Nearby Available Food</h3>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!foods || foods.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="No food nearby right now"
        subtitle="Try increasing your search radius, or check back soon — new listings appear in real time."
      />
    );
  }

  return (
    <div>
      <h3>Nearby Available Food</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <input
          placeholder="Search food name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, margin: 0 }}
        />
        <select value={foodTypeFilter} onChange={(e) => setFoodTypeFilter(e.target.value)} style={{ margin: 0 }}>
          <option value="">All Food Types</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="mixed">Mixed</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ margin: 0 }}>
          <option value="distance">Sort: Nearest First</option>
          <option value="expiry">Sort: Expiring Soonest</option>
          <option value="quantity">Sort: Largest Quantity</option>
        </select>
      </div>

      {filteredFoods.length === 0 ? (
        <p>No matching food listings found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredFoods.map((food) => {
            const urgency = getUrgencyLabel(food.expiresAt);
            return (
              <div key={food._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4>{food.foodName}</h4>
                  <span>{food.distanceInKm?.toFixed(1)} km away</span>
                </div>

                {food.images && food.images.length > 0 && (
                  <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 8 }}>
                    {food.images.map((img, idx) => (
                     <img
                       key={idx}
                       src={`${import.meta.env.VITE_SOCKET_URL}${img}`}
                       alt={food.foodName}
                       loading="lazy"
                       style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 4 }}
                      />
                    ))}
                  </div>
                )}

                <p>
                  {food.quantity} {food.quantityUnit} — {food.foodType}
                </p>
                <p>Pickup: {food.pickupAddress}</p>
                <p>
                  Donor: {food.donor?.organizationName || food.donor?.name}{" "}
                  <RatingBadge userId={food.donor?._id} />
                </p>
                <p style={{ color: urgency.color, fontWeight: "bold" }}>{urgency.text}</p>

                <button onClick={() => handleClaim(food._id)} disabled={claimingId === food._id}>
                  {claimingId === food._id ? "Claiming..." : "Claim Food"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NearbyFoodList;