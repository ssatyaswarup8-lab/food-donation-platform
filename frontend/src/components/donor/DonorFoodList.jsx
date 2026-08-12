import { useState } from "react";
import toast from "react-hot-toast";
import { deleteFood } from "../../services/food.service";
import ReviewModal from "../common/ReviewModal";
import ConfirmModal from "../common/ConfirmModal";


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
  const [reviewingDeliveryId, setReviewingDeliveryId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

 const handleDelete = async (id) => {
  setDeletingId(id);
  try {
    await deleteFood(id);
    toast.success("Listing deleted");
    onFoodChanged();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to delete listing");
  } finally {
    setDeletingId(null);
    setConfirmDeleteId(null);
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
            </div>

          {food.images && food.images.length > 0 && (
  <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 8 }}>
    {food.images.map((img, idx) => (
     <img
           key={idx}
           src={`${import.meta.env.VITE_SOCKET_URL}${img}`}
          alt={`${food.foodName} ${idx + 1}`}
          loading="lazy"
          style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 4 }}
/>
    ))}
  </div>
)}

            {food.image && (
              <p style={{ fontSize: 12 }}>
                Quality: <strong>{food.qualityStatus?.toUpperCase()}</strong>
                {food.qualityStatus === "rejected" && ` — ${food.qualityRejectionReason}`}
              </p>
            )}

            <p>
              {food.quantity} {food.quantityUnit} — {food.foodType}
            </p>
            <p>Pickup: {food.pickupAddress}</p>
            <p>Expires: {new Date(food.expiresAt).toLocaleString()}</p>

            {food.status === "available" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onEdit(food)}>Edit</button>
                <button onClick={() => setConfirmDeleteId(food._id)} disabled={deletingId === food._id}>
                  {deletingId === food._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
            {food.status === "completed" && food.deliveryId && (
  <>
    <button onClick={() => setReviewingDeliveryId(food.deliveryId)}>
      Rate NGO / Volunteer
    </button>

    {reviewingDeliveryId === food.deliveryId && (
      <ReviewModal
        deliveryId={food.deliveryId}
        onClose={() => setReviewingDeliveryId(null)}
      />
    )}
  </>
)}
          </div>
        ))}
      </div>
      {confirmDeleteId && (
  <ConfirmModal
    title="Delete Listing?"
    message="This action cannot be undone."
    confirmLabel="Delete"
    onConfirm={() => handleDelete(confirmDeleteId)}
    onCancel={() => setConfirmDeleteId(null)}
  />
)}
    </div>
  );
};

export default DonorFoodList;