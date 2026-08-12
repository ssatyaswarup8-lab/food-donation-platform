const steps = [
  { key: "assigned", label: "Volunteer Assigned", emoji: "✅" },
  { key: "picked_up", label: "Picked Up", emoji: "📦" },
  { key: "delivered", label: "Delivered", emoji: "🏠" },
  { key: "completed", label: "Completed", emoji: "🎉" },
];

const statusOrder = ["pending_assignment", "assigned", "picked_up", "delivered", "completed"];

const DeliveryStatusTimeline = ({ currentStatus }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "10%",
          right: "10%",
          height: 3,
          background: "var(--border-color)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "10%",
          height: 3,
          background: "var(--primary-green)",
          zIndex: 1,
          width: `${Math.max(0, Math.min(currentIndex, steps.length)) / (steps.length - 1) * 80}%`,
          transition: "width 0.6s ease",
        }}
      />

      {steps.map((step, idx) => {
        const stepStatusIndex = statusOrder.indexOf(step.key);
        const isDone = currentIndex >= stepStatusIndex;
        const isActive = currentStatus === step.key;

        return (
          <div
            key={step.key}
            style={{
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 80,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: isDone ? "var(--primary-green)" : "var(--card-bg)",
                border: `2px solid ${isDone ? "var(--primary-green)" : "var(--border-color)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "all 0.4s ease",
                boxShadow: isActive ? "0 0 0 5px rgba(46,125,50,0.2)" : "none",
              }}
            >
              {step.emoji}
            </div>
            <span
              style={{
                fontSize: 11,
                textAlign: "center",
                marginTop: 6,
                color: isDone ? "var(--text-dark)" : "var(--text-muted)",
                fontWeight: isActive ? "bold" : "normal",
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryStatusTimeline;