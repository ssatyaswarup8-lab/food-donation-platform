const { validationResult } = require("express-validator");
const { error } = require("../utils/apiResponse");

// Runs after express-validator's check(...) rules — collects errors and responds once
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return error(res, 400, firstError);
  }
  next();
};

module.exports = validate;