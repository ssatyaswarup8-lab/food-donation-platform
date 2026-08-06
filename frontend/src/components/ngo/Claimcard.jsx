import { cancelClaim } from "../../services/claim.service";
import { useState } from "react";

const statusColors = {
  claimed: "orange",
  cancelled: "red",
  completed: "green",
};

const ClaimCard = ({ claim, onChanged }) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this claim? The food will become available to other NGOs.")) return;

    setCancelling(true);
    try {
      await cancelClaim(claim._id);
      onChanged();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel claim");
    } finally {
      setCancelling(false);
    }
  };

  const deliveryStatus = claim.foodId?.status;

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4>{claim.foodId?.foodName}</h4>
        <span style={{ color: statusColors[claim.status] || "black", fontWeight: "bold" }}>
          {claim.status.toUpperCase()}
        </span>
      </div>

      <p>
        {claim.foodId?.quantity} {claim.foodId?.quantityUnit}
      </p>
      <p>Donor: {claim.donorId?.organizationName || claim.donorId?.name}</p>
      <p>Donor Phone: {claim.donorId?.phone}</p>
      <p>Delivery status: {deliveryStatus}</p>
      <p>Claimed at: {new Date(claim.claimedAt).toLocaleString()}</p>

      {claim.status === "claimed" && deliveryStatus === "claimed" && (
        <button onClick={handleCancel} disabled={cancelling}>
          {cancelling ? "Cancelling..." : "Cancel Claim"}
        </button>
      )}
    </div>
  );
};

export default ClaimCard;