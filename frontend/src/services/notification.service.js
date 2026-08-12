import api from "./api";

export const getMyNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markNotificationsRead = async () => {
  const res = await api.put("/notifications/mark-read");
  return res.data;
};