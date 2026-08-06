const { error } = require("../utils/apiResponse");

// Usage: authorizeRoles("admin", "ngo")
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(
        res,
        403,
        `Role '${req.user ? req.user.role : "unknown"}' is not authorized to access this resource`
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };