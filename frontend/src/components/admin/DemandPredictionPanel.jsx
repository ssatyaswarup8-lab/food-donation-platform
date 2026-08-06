import { useState, useEffect } from "react";
import { getDemandPrediction } from "../../services/ai.service";

const labelColors = {
  "Very High": "darkred",
  High: "red",
  Moderate: "orange",
  Low: "green",
};

const DemandPredictionPanel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPrediction = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDemandPrediction();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load demand prediction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  return (
    <div>
      <h3>AI Demand Prediction — Areas Needing Food Most</h3>
      <p style={{ fontSize: 13, color: "#666" }}>
        Based on historical claim frequency, recency, and cancellation patterns across NGOs.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Analyzing demand data...</p>
      ) : data.length === 0 ? (
        <p>Not enough historical claim data yet to generate predictions.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Demand</th>
              <th>Total Claims</th>
              <th>Qty Claimed</th>
              <th>Active NGOs</th>
              <th>Last Claim</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.area}</td>
                <td style={{ color: labelColors[item.demandLabel], fontWeight: "bold" }}>
                  {item.demandLabel} ({item.demandScore})
                </td>
                <td>{item.totalClaims}</td>
                <td>{item.totalQuantityClaimed}</td>
                <td>{item.activeNGOs}</td>
                <td>{item.daysSinceLastClaim} days ago</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DemandPredictionPanel;