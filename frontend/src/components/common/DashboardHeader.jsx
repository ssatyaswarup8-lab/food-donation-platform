const DashboardHeader = ({ icon, title, subtitle, gradient }) => {
  return (
    <div
      style={{
        background: gradient || "linear-gradient(135deg, #2e7d32, #1b5e20)",
        borderRadius: 14,
        padding: "28px 24px",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
        color: "white",
      }}
      className="dash-header-animate"
    >
      <div className="floating-icon" style={{ fontSize: 60, position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: 0.25 }}>
        {icon}
      </div>
      <h2 style={{ color: "white", margin: 0, position: "relative", zIndex: 1 }}>
        {icon} {title}
      </h2>
      {subtitle && (
        <p style={{ margin: "6px 0 0", opacity: 0.9, position: "relative", zIndex: 1, fontSize: 14 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default DashboardHeader;