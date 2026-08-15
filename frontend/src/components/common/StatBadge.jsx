import { useState, useEffect } from "react";

const StatBadge = ({ label, value, icon, color = "var(--primary-green)" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "number" ? value : 0;

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = Math.max(Math.floor(duration / (numericValue || 1)), 15);

    if (numericValue === 0) {
      setDisplayValue(0);
      return;
    }

    const timer = setInterval(() => {
      start += Math.ceil(numericValue / 30);
      if (start >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <div className="card stat-badge-pop" style={{ textAlign: "center", minWidth: 120 }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: "bold", color }}>
        {typeof value === "number" ? displayValue : value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
};

export default StatBadge;