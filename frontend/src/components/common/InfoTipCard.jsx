const InfoTipCard = ({ icon, title, tips = [] }) => {
  return (
    <div className="card stagger-item" style={{ marginBottom: 16 }}>
      <h4 style={{ marginTop: 0 }}>
        {icon} {title}
      </h4>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-muted)" }}>
        {tips.map((tip, idx) => (
          <li key={idx} style={{ marginBottom: 6 }}>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfoTipCard;