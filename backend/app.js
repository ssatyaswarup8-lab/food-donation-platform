const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const errorHandler = require("./middlewares/error.middleware");
const claimRoutes = require("./routes/claim.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/ai.routes");
const { generalLimiter } = require("./middlewares/rateLimiter.middleware");
const reviewRoutes = require("./routes/review.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", generalLimiter);
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
// Day 2+ will add: /api/foods, /api/claims, /api/deliveries, /api/volunteers, /api/admin, /api/ai

app.use("/api/foods", foodRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;