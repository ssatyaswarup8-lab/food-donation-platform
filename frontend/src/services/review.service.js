import api from "./api";

export const createReview = async (deliveryId, data) => {
  const res = await api.post(`/reviews/${deliveryId}`, data);
  return res.data;
};

export const getUserReviews = async (userId) => {
  const res = await api.get(`/reviews/user/${userId}`);
  return res.data;
};

export const getMyGivenReviews = async () => {
  const res = await api.get("/reviews/given");
  return res.data;
};

export const getReviewableParticipants = async (deliveryId) => {
  const res = await api.get(`/reviews/${deliveryId}/reviewable`);
  return res.data;
};