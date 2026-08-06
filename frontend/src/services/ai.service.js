import api from "./api";

export const getSpoilagePrediction = async (data) => {
  const res = await api.post("/ai/spoilage-prediction", data);
  return res.data;
};
export const getDemandPrediction = async () => {
  const res = await api.get("/ai/demand-prediction");
  return res.data;
};
export const getOptimizedRoute = async (deliveryId) => {
  const res = await api.get(`/ai/route-optimization/${deliveryId}`);
  return res.data;
};