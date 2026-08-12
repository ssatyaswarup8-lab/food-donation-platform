const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmLabel = "Confirm" }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div className="card" style={{ width: 340, textAlign: "center" }}>
        <h3>{title}</h3>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
          <button className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;