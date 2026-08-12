const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead } = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, getMyNotifications);
router.put("/mark-read", protect, markAsRead);

module.exports = router;