const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { error } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return error(res, 401, "User no longer exists");
      }

      next();
    } catch (err) {
      return error(res, 401, "Not authorized, token failed");
    }
  }

  if (!token) {
    return error(res, 401, "Not authorized, no token provided");
  }
};

module.exports = { protect };