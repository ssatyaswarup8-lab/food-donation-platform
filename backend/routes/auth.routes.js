const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { registerValidation, loginValidation } = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");

router.post("/register", authLimiter, registerValidation, validate, registerUser);
router.post("/login", authLimiter, loginValidation, validate, loginUser);
router.get("/me", protect, getMe);

module.exports = router;