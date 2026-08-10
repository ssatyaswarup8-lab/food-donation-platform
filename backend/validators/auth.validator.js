const { body } = require("express-validator");

exports.registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/).withMessage("Phone number must be exactly 10 digits"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["donor", "ngo", "volunteer"]).withMessage("Invalid role selected"),

  body("donorType")
    .optional()
    .isIn(["restaurant", "hotel", "wedding_organizer", "college_canteen", "individual"])
    .withMessage("Invalid donor type"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required"),
];

exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];