import api from "./api";

export const createFood = async (formData) => {
  const res = await api.post("/foods", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getMyFoods = async () => {
  const res = await api.get("/foods/my-listings");
  return res.data;
};

export const updateFood = async (id, formData) => {
  const res = await api.put(`/foods/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteFood = async (id) => {
  const res = await api.delete(`/foods/${id}`);
  return res.data;
};

export const getFoodById = async (id) => {
  const res = await api.get(`/foods/${id}`);
  return res.data;
};

export const getAllFoodsPaginated = async (page = 1, limit = 10) => {
  const res = await api.get(`/foods?page=${page}&limit=${limit}`);
  return res.data;
};