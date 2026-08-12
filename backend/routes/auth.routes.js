const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, forgotPassword, resetPassword, updateProfile } = require("../controllers/auth.controller");
const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { registerValidation, loginValidation } = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (donor, ngo, or volunteer)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone, role, address]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [donor, ngo, volunteer] }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", authLimiter, registerValidation, validate, registerUser);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (donor, ngo, or volunteer)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone, role, address]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [donor, ngo, volunteer] }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/login", authLimiter, loginValidation, validate, loginUser);
router.get("/me", protect, getMe);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.put("/update-profile", protect, upload.single("profileImage"), updateProfile);

module.exports = router;