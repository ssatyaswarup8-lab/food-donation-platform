import { useState, useEffect } from "react";
import { getUserReviews } from "../../services/review.service";

const RatingBadge = ({ userId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!userId) return;
    getUserReviews(userId)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [userId]);

  if (!data || data.totalReviews === 0) {
    return <span style={{ fontSize: 12, color: "#999" }}>No ratings yet</span>;
  }

  return (
    <span style={{ fontSize: 13, color: "#ff8f00", fontWeight: "bold" }}>
      ★ {data.averageRating} ({data.totalReviews} review{data.totalReviews !== 1 ? "s" : ""})
    </span>
  );
};

export default RatingBadge;