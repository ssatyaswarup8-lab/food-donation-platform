import { useState } from "react";
import { createFood } from "../../services/food.service";

const FoodPostForm = ({ onFoodPosted }) => {
  const initialFormData = {
    foodName: "",
    quantity: "",
    quantityUnit: "plates",
    foodType: "veg",
    description: "",
    preparedAt: "",
    expiresAt: "",
    pickupAddress: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle text/select/input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);

    setImages(files);
  };

  // Get user's current location
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          longitude: 0,
          latitude: 0,
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          });
        },
        () => {
          // If user denies location, continue with default coordinates
          resolve({
            longitude: 0,
            latitude: 0,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // Validate dates
  const validateDates = () => {
    if (!formData.preparedAt || !formData.expiresAt) {
      return "Please select preparation and expiry time.";
    }

    const preparedDate = new Date(formData.preparedAt);
    const expiresDate = new Date(formData.expiresAt);

    if (Number.isNaN(preparedDate.getTime())) {
      return "Invalid preparation date.";
    }

    if (Number.isNaN(expiresDate.getTime())) {
      return "Invalid expiry date.";
    }

    if (expiresDate <= preparedDate) {
      return "Expiry time must be after preparation time.";
    }

    return "";
  };

  // Submit food
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccessMsg("");

    // Validate dates
    const dateError = validateDates();

    if (dateError) {
      setError(dateError);
      return;
    }

    // Validate quantity
    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    setLoading(true);

    try {
      // Get location
      const coords = await getLocation();

      // Create multipart/form-data
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      // Add location
      payload.append("longitude", coords.longitude);
      payload.append("latitude", coords.latitude);

      // Add images
      images.forEach((file) => {
        payload.append("images", file);
      });

      console.log("Posting food...");

      // API call
      await createFood(payload);

      console.log("Food posted successfully");

      // Show success message
      setSuccessMsg("Food listed successfully!");

      // Reset form
      setFormData(initialFormData);

      // IMPORTANT:
      // Reset images using setImages, not setImage
      setImages([]);

      // Reset file input if needed
      const fileInput = document.getElementById("food-images");

      if (fileInput) {
        fileInput.value = "";
      }

      // Refresh donor food list
      if (onFoodPosted) {
        onFoodPosted();
      }
    } catch (err) {
      console.error("Food posting error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to post food"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 16,
        marginBottom: 20,
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h3>Post Surplus Food</h3>

      {/* Error message */}
      {error && (
        <p
          style={{
            color: "red",
            background: "#fff1f1",
            padding: "10px 12px",
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {error}
        </p>
      )}

      {/* Success message */}
      {success && (
        <p
          style={{
            color: "green",
            background: "#effaf1",
            padding: "10px 12px",
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Food Name */}
        <input
          name="foodName"
          placeholder="Food Name (e.g. Veg Biryani)"
          value={formData.foodName}
          onChange={handleChange}
          required
        />

        {/* Quantity */}
        <input
          name="quantity"
          type="number"
          min="1"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        {/* Quantity Unit */}
        <select
          name="quantityUnit"
          value={formData.quantityUnit}
          onChange={handleChange}
        >
          <option value="plates">Plates</option>
          <option value="kg">Kg</option>
          <option value="packets">Packets</option>
          <option value="liters">Liters</option>
        </select>

        {/* Food Type */}
        <select
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="mixed">Mixed</option>
        </select>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />

        {/* Prepared At */}
        <label>Prepared At:</label>

        <input
          name="preparedAt"
          type="datetime-local"
          value={formData.preparedAt}
          onChange={handleChange}
          required
        />

        {/* Expires At */}
        <label>Expires At:</label>

        <input
          name="expiresAt"
          type="datetime-local"
          value={formData.expiresAt}
          onChange={handleChange}
          required
        />

        {/* Pickup Address */}
        <input
          name="pickupAddress"
          placeholder="Pickup Address"
          value={formData.pickupAddress}
          onChange={handleChange}
          required
        />

        {/* Images */}
        <label>Food Images (up to 5):</label>

        <input
          id="food-images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        {/* Selected images */}
        {images.length > 0 && (
          <p
            style={{
              fontSize: 12,
              color: "#555",
              marginTop: 8,
            }}
          >
            {images.length} image(s) selected
          </p>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Food"}
        </button>
      </form>
    </div>
  );
};

export default FoodPostForm;