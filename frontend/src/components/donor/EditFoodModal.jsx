import { useState } from "react";
import { updateFood } from "../../services/food.service";

const EditFoodModal = ({ food, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    foodName: food.foodName,
    quantity: food.quantity,
    quantityUnit: food.quantityUnit,
    foodType: food.foodType,
    description: food.description || "",
    preparedAt: food.preparedAt?.slice(0, 16),
    expiresAt: food.expiresAt?.slice(0, 16),
    pickupAddress: food.pickupAddress,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => payload.append(key, formData[key]));

      await updateFood(food._id, payload);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ background: "white", padding: 20, width: 400, borderRadius: 6 }}>
        <h3>Edit Food Listing</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input name="foodName" value={formData.foodName} onChange={handleChange} required />
          <input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            required
          />

          <select name="quantityUnit" value={formData.quantityUnit} onChange={handleChange}>
            <option value="plates">Plates</option>
            <option value="kg">Kg</option>
            <option value="packets">Packets</option>
            <option value="liters">Liters</option>
          </select>

          <select name="foodType" value={formData.foodType} onChange={handleChange}>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
            <option value="mixed">Mixed</option>
          </select>

          <textarea name="description" value={formData.description} onChange={handleChange} />

          <label>Prepared At:</label>
          <input
            name="preparedAt"
            type="datetime-local"
            value={formData.preparedAt}
            onChange={handleChange}
            required
          />

          <label>Expires At:</label>
          <input
            name="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={handleChange}
            required
          />

          <input
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            required
          />

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFoodModal;