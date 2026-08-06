import api from "./api";

export const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/admin/users${params ? `?${params}` : ""}`);
  return res.data;
};

export const verifyUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/verify`);
  return res.data;
};

export const toggleUserStatus = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/toggle-status`);
  return res.data;
};

export const getAllDeliveriesAdmin = async (status) => {
  const res = await api.get(`/admin/deliveries${status ? `?status=${status}` : ""}`);
  return res.data;
};

export const assignVolunteer = async (deliveryId) => {
  const res = await api.post(`/deliveries/${deliveryId}/assign`);
  return res.data;
};

export const getAnalyticsSummary = async () => {
  const res = await api.get("/admin/analytics/summary");
  return res.data;
};

export const getDailyDonations = async () => {
  const res = await api.get("/admin/analytics/daily");
  return res.data;
};

export const getMonthlyDonations = async () => {
  const res = await api.get("/admin/analytics/monthly");
  return res.data;
};

export const getFoodCategoryBreakdown = async () => {
  const res = await api.get("/admin/analytics/categories");
  return res.data;
};

export const approveFoodQuality = async (foodId) => {
  const res = await api.put(`/admin/foods/${foodId}/approve-quality`);
  return res.data;
};

export const rejectFoodQuality = async (foodId, reason) => {
  const res = await api.put(`/admin/foods/${foodId}/reject-quality`, { reason });
  return res.data;
};

export const getAllFoodsAdmin = async (status) => {
  const res = await api.get(`/admin/foods${status ? `?status=${status}` : ""}`);
  return res.data;
};