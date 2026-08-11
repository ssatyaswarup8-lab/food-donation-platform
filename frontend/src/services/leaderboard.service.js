import api from "./api";

export const getTopDonors = async () => {
  const res = await api.get("/leaderboard/donors");
  return res.data;
};

export const getTopVolunteers = async () => {
  const res = await api.get("/leaderboard/volunteers");
  return res.data;
};

export const getTopNGOs = async () => {
  const res = await api.get("/leaderboard/ngos");
  return res.data;
};