const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword,
  updateProfile,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { registerValidation, loginValidation } = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");

router.post("/register", authLimiter, registerValidation, validate, registerUser);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", authLimiter, resendVerificationOTP);
router.post("/login", authLimiter, loginValidation, validate, loginUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, upload.single("profileImage"), updateProfile);

module.exports = router;