import { useState } from "react";
import { getSpoilagePrediction } from "../../services/ai.service";

const riskColors = {
  safe: "green",
  caution: "orange",
  critical: "red",
  expired: "darkred",
};

const SpoilagePredictor = () => {
  const [formData, setFormData] = useState({
    foodType: "veg",
    temperature: "",
    preparedAt: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await getSpoilagePrediction(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginBottom: 20 }}>
      <h3>AI Food Spoilage Prediction</h3>
      <p style={{ fontSize: 13, color: "#666" }}>
        Estimate how many more hours your food remains safe to eat, based on food type,
        temperature, and time since preparation.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Food Type:</label>
        <select name="foodType" value={formData.foodType} onChange={handleChange}>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="mixed">Mixed</option>
          <option value="dairy">Dairy-based</option>
          <option value="rice">Rice-based</option>
          <option value="gravy">Gravy/Curry</option>
        </select>

        <label>Current/Storage Temperature (°C):</label>
        <input
          name="temperature"
          type="number"
          placeholder="e.g. 28"
          value={formData.temperature}
          onChange={handleChange}
          required
        />

        <label>Prepared At:</label>
        <input
          name="preparedAt"
          type="datetime-local"
          value={formData.preparedAt}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Predict Spoilage"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: `2px solid ${riskColors[result.riskLevel]}`,
            borderRadius: 6,
          }}
        >
          <p style={{ color: riskColors[result.riskLevel], fontWeight: "bold" }}>
            {result.riskLevel.toUpperCase()}
          </p>
          <p>
            <strong>Safe for approximately {result.safeHoursLeft} more hours</strong>
          </p>
          <p>Hours since prepared: {result.hoursSincePrepared}</p>
          <p>{result.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default SpoilagePredictor;