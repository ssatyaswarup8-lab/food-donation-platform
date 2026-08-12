const rateLimit = require("express-rate-limit");
const { error } = require("../utils/apiResponse");

const isTestEnv = process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: (req, res) => {
    return error(res, 429, "Too many attempts. Please try again after 15 minutes.");
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: (req, res) => {
    return error(res, 429, "Too many requests. Please slow down.");
  },
});

const createFoodLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: (req, res) => {
    return error(res, 429, "Too many food listings posted. Please try again later.");
  },
});

module.exports = { authLimiter, generalLimiter, createFoodLimiter };