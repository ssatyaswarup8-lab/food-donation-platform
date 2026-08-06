import api from "./api";

export const getMyDeliveries = async () => {
  const res = await api.get("/deliveries/my-deliveries");
  return res.data;
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  const res = await api.put(`/deliveries/${deliveryId}/status`, { status });
  return res.data;
};

export const getDeliveryById = async (deliveryId) => {
  const res = await api.get(`/deliveries/${deliveryId}`);
  return res.data;
};