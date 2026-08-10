import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getMyFoods } from "../../services/food.service";
import FoodPostForm from "../../components/donor/FoodPostForm";
import DonorFoodList from "../../components/donor/DonorFoodList";
import EditFoodModal from "../../components/donor/EditFoodModal";
import SpoilagePredictor from "../../components/donor/SpoilagePredictor";
import { SkeletonCard } from "../../components/common/Skeleton";

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFood, setEditingFood] = useState(null);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await getMyFoods();
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleClaimed = (data) => {
      toast.success(`"${data.foodName}" was claimed by ${data.claimedBy}!`);
      fetchFoods();
    };
    const handleApproved = (data) => {
      toast.success(`"${data.foodName}" passed quality review!`);
      fetchFoods();
    };
    const handleRejected = (data) => {
      toast.error(`"${data.foodName}" was rejected: ${data.reason}`);
      fetchFoods();
    };

    socket.on("food-claimed", handleClaimed);
    socket.on("food-quality-approved", handleApproved);
    socket.on("food-quality-rejected", handleRejected);

    return () => {
      socket.off("food-claimed", handleClaimed);
      socket.off("food-quality-approved", handleApproved);
      socket.off("food-quality-rejected", handleRejected);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Donor Dashboard</h2>
        <div>
          <span>Welcome, {user?.name} </span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {!user?.isVerified && (
        <p style={{ color: "orange" }}>
          Your account is pending admin verification. You can still post food, but visibility to
          NGOs may be limited until verified.
        </p>
      )}

      <SpoilagePredictor />

      <FoodPostForm onFoodPosted={fetchFoods} />

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <DonorFoodList foods={foods} onFoodChanged={fetchFoods} onEdit={setEditingFood} />
      )}

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onUpdated={fetchFoods}
        />
      )}
    </div>
  );
};

export default DonorDashboard;