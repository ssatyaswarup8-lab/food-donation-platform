import api from "./api";

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const getMyProfile = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await api.put("/auth/update-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};