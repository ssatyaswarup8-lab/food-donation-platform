const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const { success, error } = require("../utils/apiResponse");

// @desc    Register new user (donor/ngo/volunteer)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      donorType,
      organizationName,
      address,
      longitude,
      latitude,
    } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return error(res, 400, "Please provide all required fields");
    }

    if (role === "admin") {
      return error(res, 403, "Cannot self-register as admin");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return error(res, 400, "User already exists with this email");
    }

   const userData = {
  name,
  email,
  password,
  phone,
  role,
  organizationName,
  address,
  location: {
    type: "Point",
    coordinates: [longitude || 0, latitude || 0],
  },
  isVerified: role === "volunteer",
};

if (role === "donor" && donorType) {
  userData.donorType = donorType;
}

const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    return success(res, 201, "User registered successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token,
    });
  } catch (err) {
    console.log(err);
    return error(res, 500, err.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 400, "Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return error(res, 401, "Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return error(res, 401, "Invalid email or password");
    }

    if (!user.isActive) {
      return error(res, 403, "Account has been deactivated. Contact admin.");
    }

    const token = generateToken(user._id, user.role);

    return success(res, 200, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 404, "User not found");
    return success(res, 200, "User profile fetched", user);
  } catch (err) {
    return error(res, 500, err.message);
  }
};