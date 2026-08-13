const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const { success, error } = require("../utils/apiResponse");
const { sendOTPEmail, sendVerificationEmail } = require("../services/notificationEmail.service");

// Helper: generate a 6-digit OTP and its hashed version
const generateOTP = async () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);
  return { otp, hashedOTP };
};

// @desc    Register new user (donor/ngo/volunteer) — sends email verification OTP
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

    const { otp, hashedOTP } = await generateOTP();
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
  isEmailVerified: false,
  emailVerificationOTP: hashedOTP,
  emailVerificationOTPExpires: Date.now() + 10 * 60 * 1000,
});

    const emailSent = await sendVerificationEmail(user.email, user.name, otp);
    console.log(`📧 [DEV MODE] OTP for ${user.email}: ${otp} | Email sent: ${emailSent}`);

    // No token issued yet — user must verify email before logging in
    return success(res, 201, "Registration successful. Please check your email for the verification code.", {
      email: user.email,
      requiresVerification: true,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Verify email using OTP sent at registration
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return error(res, 400, "Email and OTP are required");
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOTP +emailVerificationOTPExpires"
    );

    if (!user) {
      return error(res, 404, "User not found");
    }

    if (user.isEmailVerified) {
      return error(res, 400, "Email is already verified");
    }

    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
      return error(res, 400, "No verification pending. Please request a new OTP.");
    }

    if (Date.now() > user.emailVerificationOTPExpires) {
      return error(res, 400, "OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, user.emailVerificationOTP);
    if (!isMatch) {
      return error(res, 400, "Invalid OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    return success(res, 200, "Email verified successfully!", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      token,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 404, "User not found");
    }

    if (user.isEmailVerified) {
      return error(res, 400, "Email is already verified");
    }

    const { otp, hashedOTP } = await generateOTP();

    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendVerificationEmail(user.email, user.name, otp);
    console.log(`📧 [DEV MODE] OTP for ${user.email}: ${otp} | Email sent: ${emailSent}`);

    return success(res, 200, "Verification OTP resent. Please check your email.");
  } catch (err) {
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

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id, user.role);

    return success(res, 200, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
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

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/update-profile
// @access  Private
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

// @desc    Request password reset — sends OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
      return success(res, 200, "If that email exists, an OTP has been sent");
    }

    const { otp, hashedOTP } = await generateOTP();

    user.resetOTP = hashedOTP;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    return success(res, 200, "If that email exists, an OTP has been sent");
  } catch (err) {
    console.log(err);
    return error(res, 500, err.message);
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
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