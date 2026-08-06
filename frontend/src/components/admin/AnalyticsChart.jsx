const AnalyticsChart = ({ title, data, labelKey, valueKey }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ marginBottom: 20 }}>
        <h4>{title}</h4>
        <p>No data yet.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[valueKey]));

  return (
    <div style={{ marginBottom: 20 }}>
      <h4>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 100, fontSize: 12 }}>{item[labelKey]}</span>
            <div
              style={{
                background: "#4CAF50",
                height: 16,
                width: `${(item[valueKey] / maxValue) * 200}px`,
                minWidth: 2,
              }}
            />
            <span style={{ fontSize: 12 }}>{item[valueKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;