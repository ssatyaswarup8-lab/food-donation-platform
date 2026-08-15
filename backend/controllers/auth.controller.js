const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const { success, error } = require("../utils/apiResponse");
const { sendOTPEmail } = require("../services/notificationEmail.service");

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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      donorType: role === "donor" && donorType ? donorType : undefined,
      organizationName,
      address,
      location: {
        type: "Point",
        coordinates: [longitude || 0, latitude || 0],
      },
      isVerified: role === "volunteer",
    });

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
    return error(res, 500, err.message);
  }
};

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

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 404, "User not found");
    return success(res, 200, "User profile fetched", user);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, organizationName } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return error(res, 404, "User not found");

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (req.file) user.profileImage = `/uploads/${req.file.filename}`;

    await user.save();

    return success(res, 200, "Profile updated successfully", user);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
      return success(res, 200, "If that email exists, an OTP has been sent");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.resetOTP = hashedOTP;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    return success(res, 200, "If that email exists, an OTP has been sent");
  } catch (err) {
    return error(res, 500, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return error(res, 400, "Email, OTP, and new password are required");
    }

    if (newPassword.length < 6) {
      return error(res, 400, "Password must be at least 6 characters");
    }

    const user = await User.findOne({ email }).select("+resetOTP +resetOTPExpires +password");

    if (!user || !user.resetOTP || !user.resetOTPExpires) {
      return error(res, 400, "Invalid or expired OTP");
    }

    if (Date.now() > user.resetOTPExpires) {
      return error(res, 400, "OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      return error(res, 400, "Invalid OTP");
    }

    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    return success(res, 200, "Password reset successfully. Please log in.");
  } catch (err) {
    return error(res, 500, err.message);
  }
};