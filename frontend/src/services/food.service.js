import api from "./api";

/**
 * Create a new food listing
 */
export const createFood = async (formData) => {
  const res = await api.post("/foods", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/**
 * Get foods created by the logged-in donor
 */
export const getMyFoods = async () => {
  const res = await api.get("/foods/my-listings");
  return res.data;
};

/**
 * Update an existing food listing
 */
export const updateFood = async (id, formData) => {
  const res = await api.put(`/foods/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/**
 * Delete a food listing
 */
export const deleteFood = async (id) => {
  const res = await api.delete(`/foods/${id}`);
  return res.data;
};

/**
 * Get a single food listing
 */
export const getFoodById = async (id) => {
  const res = await api.get(`/foods/${id}`);
  return res.data;
};

/**
 * Get all foods with pagination
 */
export const getAllFoodsPaginated = async (page = 1, limit = 10) => {
  const res = await api.get(`/foods?page=${page}&limit=${limit}`);
  return res.data;
};

/**
 * Get nearby available food for NGO
 *
 * distance is in kilometers.
 *
 * Example:
 * getNearbyFoods(10)
 * -> GET /foods/nearby?distance=10
 */
export const getNearbyFoods = async (distance = 10) => {
  const res = await api.get(`/foods/nearby?distance=${distance}`);

  return res.data;
};