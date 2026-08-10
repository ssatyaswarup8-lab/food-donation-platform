import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RatingStars from "./RatingStars";
import { getReviewableParticipants, createReview } from "../../services/review.service";

const ReviewModal = ({ deliveryId, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await getReviewableParticipants(deliveryId);
      setParticipants(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId]);

  const handleSubmit = async () => {
    if (!selected) {
      toast.error("Select a participant to review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setSubmitting(true);
    try {
      await createReview(deliveryId, { toUserId: selected._id, rating, comment });
      toast.success(`Review submitted for ${selected.name}`);
      setSelected(null);
      setRating(0);
      setComment("");
      fetchParticipants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

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
        zIndex: 1000,
      }}
    >
      <div style={{ background: "white", padding: 20, width: 420, borderRadius: 8 }}>
        <h3>Rate Your Experience</h3>

        {loading ? (
          <p>Loading...</p>
        ) : participants.length === 0 ? (
          <p>No one left to review for this delivery.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#666" }}>Select who you'd like to rate:</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {participants.map((p) => (
                <button
                  key={p._id}
                  onClick={() => !p.alreadyReviewed && setSelected(p)}
                  disabled={p.alreadyReviewed}
                  className={selected?._id === p._id ? "" : "btn-outline"}
                  style={{ opacity: p.alreadyReviewed ? 0.5 : 1 }}
                >
                  {p.organizationName || p.name} ({p.role}) {p.alreadyReviewed && "✓ Reviewed"}
                </button>
              ))}
            </div>

            {selected && (
              <div>
                <p>
                  Rating for <strong>{selected.name}</strong>:
                </p>
                <RatingStars rating={rating} onChange={setRating} />

                <textarea
                  placeholder="Optional comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ marginTop: 10 }}
                />

                <button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;