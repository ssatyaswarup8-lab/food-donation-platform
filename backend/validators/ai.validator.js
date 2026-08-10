const { body } = require("express-validator");

exports.spoilagePredictionValidation = [
  body("foodType")
    .notEmpty().withMessage("Food type is required")
    .isIn(["veg", "non-veg", "mixed", "dairy", "rice", "gravy"]).withMessage("Invalid food type"),

  body("temperature")
    .notEmpty().withMessage("Temperature is required")
    .isFloat({ min: -20, max: 60 }).withMessage("Temperature must be a realistic value between -20°C and 60°C"),

  body("preparedAt")
    .notEmpty().withMessage("Prepared time is required")
    .isISO8601().withMessage("Prepared time must be a valid date"),
];