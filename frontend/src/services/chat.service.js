import api from "./api";

export const getChatHistory = async (deliveryId) => {
  const res = await api.get(`/chat/${deliveryId}`);
  return res.data;
};