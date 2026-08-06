import { useState } from "react";
import { deleteFood } from "../../services/food.service";

const statusColors = {
  available: "green",
  claimed: "orange",
  picked_up: "blue",
  delivered: "purple",
  completed: "gray",
  expired: "red",
};

const DonorFoodList = ({ foods, onFoodChanged, onEdit }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    setDeletingId(id);
    try {
      await deleteFood(id);
      onFoodChanged();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  if (!foods || foods.length === 0) {
    return <p>You haven't posted any food listings yet.</p>;
  }

  return (
    <div>
      <h3>My Food Listings</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {foods.map((food) => (
          <div key={food._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>{food.foodName}</h4>
              <span style={{ color: statusColors[food.status] || "black", fontWeight: "bold" }}>
                {food.status.toUpperCase()}
              </span>
              {food.image && (
                  <p style={{ fontSize: 12 }}>
                  Quality: <strong>{food.qualityStatus?.toUpperCase()}</strong>
                  {food.qualityStatus === "rejected" && ` — ${food.qualityRejectionReason}`}
                   </p>
)}
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
            <p>Expires: {new Date(food.expiresAt).toLocaleString()}</p>

            {food.status !== "available" && (
           <a
             href={`/delivery/${food.deliveryId}/track`}
             target="_blank"
            rel="noreferrer"
      >
    Track Delivery
  </a>
)}

            {food.status === "available" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onEdit(food)}>Edit</button>
                <button onClick={() => handleDelete(food._id)} disabled={deletingId === food._id}>
                  {deletingId === food._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorFoodList;