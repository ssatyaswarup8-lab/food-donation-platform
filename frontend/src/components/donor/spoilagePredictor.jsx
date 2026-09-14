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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!formData.temperature) {
      setError("Please enter the temperature.");
      return;
    }

    if (!formData.preparedAt) {
      setError("Prepared time is required.");
      return;
    }

    const temperature = Number(formData.temperature);

    if (!Number.isFinite(temperature)) {
      setError("Please enter a valid temperature.");
      return;
    }

    const preparedTime = new Date(formData.preparedAt);
    const currentTime = new Date();

    if (Number.isNaN(preparedTime.getTime())) {
      setError("Invalid preparation time.");
      return;
    }

    // Calculate hours since food was prepared
    const hoursSincePrepared =
      (currentTime.getTime() - preparedTime.getTime()) /
      (1000 * 60 * 60);

    if (hoursSincePrepared < 0) {
      setError("Prepared time cannot be in the future.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * Send BOTH preparedAt and hoursSincePrepared.
       *
       * preparedAt -> required by backend validation
       * hoursSincePrepared -> required by prediction model
       */

      const payload = {
        foodType: formData.foodType,
        temperature: temperature,
        preparedAt: formData.preparedAt,
        hoursSincePrepared: Number(
          hoursSincePrepared.toFixed(2)
        ),
      };

      console.log(
        "Spoilage prediction payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await getSpoilagePrediction(payload);

      console.log(
        "Spoilage prediction response:",
        response
      );

      // ai.service.js returns res.data
      setResult(response);
    } catch (err) {
      console.error(
        "Spoilage prediction error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to get spoilage prediction"
      );
    } finally {
      setLoading(false);
    }
  };

  const resultColor =
    riskColors[result?.riskLevel] || "gray";

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      <h3>AI Food Spoilage Prediction</h3>

      <p
        style={{
          fontSize: "13px",
          color: "#666",
          lineHeight: "1.5",
        }}
      >
        Estimate how many more hours your food remains safe
        based on food type, temperature, and time since
        preparation.
      </p>

      {error && (
        <div
          style={{
            color: "#b91c1c",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Food Type */}
        <label>Food Type:</label>

        <select
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            margin: "6px 0 15px",
          }}
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="mixed">Mixed</option>
          <option value="dairy">Dairy-based</option>
          <option value="rice">Rice-based</option>
          <option value="gravy">Gravy/Curry</option>
        </select>

        {/* Temperature */}
        <label>
          Current/Storage Temperature (°C):
        </label>

        <input
          name="temperature"
          type="number"
          step="0.1"
          placeholder="e.g. 28"
          value={formData.temperature}
          onChange={handleChange}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            margin: "6px 0 15px",
          }}
        />

        {/* Prepared At */}
        <label>Prepared At:</label>

        <input
          name="preparedAt"
          type="datetime-local"
          value={formData.preparedAt}
          onChange={handleChange}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            margin: "6px 0 15px",
          }}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Calculating..."
            : "Predict Spoilage"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            border: `2px solid ${resultColor}`,
            borderRadius: "8px",
          }}
        >
          <p
            style={{
              color: resultColor,
              fontWeight: "bold",
              fontSize: "18px",
              marginTop: 0,
            }}
          >
            {result.riskLevel?.toUpperCase()}
          </p>

          <p>
            <strong>
              Safe for approximately{" "}
              {result.safeHoursLeft} more hours
            </strong>
          </p>

          <p>
            Hours since prepared:{" "}
            {result.hoursSincePrepared ??
              "Calculated automatically"}
          </p>

          <p>
            {result.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default SpoilagePredictor;