const EmptyState = ({ icon = "📭", title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="empty-state-animate" style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 12 }} className="empty-state-bounce">
        {icon}
      </div>
      <h3 style={{ margin: "0 0 6px" }}>{title}</h3>
      {subtitle && (
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 360, margin: "0 auto 16px" }}>
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <button className="btn-accent" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;