const RatingStars = ({ rating, onChange, size = 22, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{
            fontSize: size,
            cursor: readOnly ? "default" : "pointer",
            color: star <= rating ? "#ff8f00" : "#ddd",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;