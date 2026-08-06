import { useState, useEffect } from "react";
import { getAllFoodsAdmin, approveFoodQuality, rejectFoodQuality } from "../../services/admin.service";

const FoodQualityReview = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await getAllFoodsAdmin();
      setFoods(res.data.filter((f) => f.qualityStatus === "pending" && f.image));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await approveFoodQuality(id);
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    setActioningId(id);
    try {
      await rejectFoodQuality(id, rejectReason);
      setRejectingId(null);
      setRejectReason("");
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h3>Food Quality Review</h3>
      <p style={{ fontSize: 13, color: "#666" }}>
        Review photos of posted food before it's shown to NGOs.
      </p>

      {loading ? (
        <p>Loading listings pending review...</p>
      ) : foods.length === 0 ? (
        <p>No food listings awaiting quality review.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {foods.map((food) => (
            <div key={food._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
              <h4>{food.foodName}</h4>
              <img
                src={`${import.meta.env.VITE_SOCKET_URL}${food.image}`}
                alt={food.foodName}
                style={{ width: 200, height: 140, objectFit: "cover" }}
              />
              <p>Donor: {food.donorId?.organizationName || food.donorId?.name}</p>
              <p>
                {food.quantity} {food.quantityUnit} — {food.foodType}
              </p>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => handleApprove(food._id)} disabled={actioningId === food._id}>
                  ✅ Approve
                </button>
                <button onClick={() => setRejectingId(food._id)} disabled={actioningId === food._id}>
                  ❌ Reject
                </button>
              </div>

              {rejectingId === food._id && (
                <div style={{ marginTop: 8 }}>
                  <input
                    placeholder="Reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ width: "70%" }}
                  />
                  <button onClick={() => handleReject(food._id)} disabled={actioningId === food._id}>
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodQualityReview;