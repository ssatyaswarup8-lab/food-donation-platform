const express = require("express");
const router = express.Router();

const { getChatHistory, sendMessage } = require("../controllers/chat.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/:deliveryId", protect, getChatHistory);
router.post("/:deliveryId", protect, sendMessage);

module.exports = router;