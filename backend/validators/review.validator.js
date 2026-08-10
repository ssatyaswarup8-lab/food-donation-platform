const { body } = require("express-validator");

exports.createReviewValidation = [
  body("toUserId")
    .notEmpty().withMessage("toUserId is required")
    .isMongoId().withMessage("Invalid user id"),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),
];