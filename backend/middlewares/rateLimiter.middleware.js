const rateLimit = require("express-rate-limit");
const { error } = require("../utils/apiResponse");

// Strict limiter for login/register — prevents brute-force & spam account creation
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(res, 429, "Too many attempts. Please try again after 15 minutes.");
  },
});

// General limiter for all other API routes — generous, just stops abuse/scraping
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(res, 429, "Too many requests. Please slow down.");
  },
});

// Very strict limiter for food posting — stops spam listings
const createFoodLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 food posts per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(res, 429, "Too many food listings posted. Please try again later.");
  },
});

module.exports = { authLimiter, generalLimiter, createFoodLimiter };