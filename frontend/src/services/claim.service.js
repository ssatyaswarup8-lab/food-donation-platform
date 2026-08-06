import api from "./api";

export const getDonorClaims = async () => {
  const res = await api.get("/claims/donor-claims");
  return res.data;
};

export const claimFood = async (foodId) => {
  const res = await api.post(`/claims/${foodId}`);
  return res.data;
};

export const getMyClaims = async () => {
  const res = await api.get("/claims/my-claims");
  return res.data;
};

export const cancelClaim = async (claimId) => {
  const res = await api.put(`/claims/${claimId}/cancel`);
  return res.data;
};