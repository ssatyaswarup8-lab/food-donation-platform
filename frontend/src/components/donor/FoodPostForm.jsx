import { useState } from "react";
import { createFood } from "../../services/food.service";

const FoodPostForm = ({ onFoodPosted }) => {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    quantityUnit: "plates",
    foodType: "veg",
    description: "",
    preparedAt: "",
    expiresAt: "",
    pickupAddress: "",
  });
 const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleImageChange = (e) => {
  const files = Array.from(e.target.files).slice(0, 5);
  setImages(files);
};

  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ longitude: 0, latitude: 0 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ longitude: pos.coords.longitude, latitude: pos.coords.latitude }),
        () => resolve({ longitude: 0, latitude: 0 })
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const coords = await getLocation();

      const payload = new FormData();
      Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
      payload.append("longitude", coords.longitude);
      payload.append("latitude", coords.latitude);
      images.forEach((file) => payload.append("images", file));
      await createFood(payload);

      setSuccessMsg("Food listed successfully!");
      setFormData({
        foodName: "",
        quantity: "",
        quantityUnit: "plates",
        foodType: "veg",
        description: "",
        preparedAt: "",
        expiresAt: "",
        pickupAddress: "",
      });
      setImage(null);

      if (onFoodPosted) onFoodPosted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginBottom: 20 }}>
      <h3>Post Surplus Food</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="foodName"
          placeholder="Food Name (e.g. Veg Biryani)"
          value={formData.foodName}
          onChange={handleChange}
          required
        />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
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

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
        />

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
          placeholder="Pickup Address"
          value={formData.pickupAddress}
          onChange={handleChange}
          required
        />

        <label>Food Images (up to 5):</label>
        <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        {images.length > 0 && <p style={{ fontSize: 12 }}>{images.length} image(s) selected</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Food"}
        </button>
      </form>
    </div>
  );
};

export default FoodPostForm;