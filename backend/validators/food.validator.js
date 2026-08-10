const { body } = require("express-validator");

exports.createFoodValidation = [
  body("foodName")
    .trim()
    .notEmpty().withMessage("Food name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Food name must be between 2 and 100 characters"),

  body("quantity")
    .notEmpty().withMessage("Quantity is required")
    .isFloat({ gt: 0 }).withMessage("Quantity must be a positive number"),

  body("quantityUnit")
    .optional()
    .isIn(["plates", "kg", "packets", "liters"]).withMessage("Invalid quantity unit"),

  body("foodType")
    .notEmpty().withMessage("Food type is required")
    .isIn(["veg", "non-veg", "mixed"]).withMessage("Invalid food type"),

  body("preparedAt")
    .notEmpty().withMessage("Prepared time is required")
    .isISO8601().withMessage("Prepared time must be a valid date"),

  body("expiresAt")
    .notEmpty().withMessage("Expiry time is required")
    .isISO8601().withMessage("Expiry time must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.preparedAt)) {
        throw new Error("Expiry time must be after prepared time");
      }
      return true;
    }),

  body("pickupAddress")
    .trim()
    .notEmpty().withMessage("Pickup address is required"),

  body("longitude")
    .notEmpty().withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),

  body("latitude")
    .notEmpty().withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
];

exports.updateFoodValidation = [
  body("foodName").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Food name must be between 2 and 100 characters"),
  body("quantity").optional().isFloat({ gt: 0 }).withMessage("Quantity must be a positive number"),
  body("quantityUnit").optional().isIn(["plates", "kg", "packets", "liters"]).withMessage("Invalid quantity unit"),
  body("foodType").optional().isIn(["veg", "non-veg", "mixed"]).withMessage("Invalid food type"),
  body("preparedAt").optional().isISO8601().withMessage("Prepared time must be a valid date"),
  body("expiresAt").optional().isISO8601().withMessage("Expiry time must be a valid date"),
  body("pickupAddress").optional().trim().notEmpty().withMessage("Pickup address cannot be empty"),
];