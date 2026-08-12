const sendEmail = require("../config/email");

const otpEmailTemplate = (name, otp) => `
  <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
    <h2 style="color: #2e7d32;">Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>Your OTP to reset your password is:</p>
    <h1 style="letter-spacing: 4px; color: #ff8f00;">${otp}</h1>
    <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

const verificationEmailTemplate = (name, otp) => `
  <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
    <h2 style="color: #2e7d32;">Verify Your Email</h2>
    <p>Hi ${name},</p>
    <p>Welcome to the Food Donation Platform! Please verify your email using the code below:</p>
    <h1 style="letter-spacing: 4px; color: #ff8f00;">${otp}</h1>
    <p>This code expires in 10 minutes. Enter it on the verification page to activate your account.</p>
  </div>
`;

const foodClaimedEmailTemplate = (donorName, foodName, claimedBy) => `
  <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
    <h2 style="color: #2e7d32;">Your Food Was Claimed!</h2>
    <p>Hi ${donorName},</p>
    <p><strong>${foodName}</strong> has been claimed by <strong>${claimedBy}</strong>. A volunteer will be assigned shortly for pickup.</p>
  </div>
`;

const sendOTPEmail = async (to, name, otp) => {
  return sendEmail({
    to,
    subject: "Password Reset OTP — Food Donation Platform",
    html: otpEmailTemplate(name, otp),
  });
};

const sendVerificationEmail = async (to, name, otp) => {
  return sendEmail({
    to,
    subject: "Verify your email — Food Donation Platform",
    html: verificationEmailTemplate(name, otp),
  });
};

const sendFoodClaimedEmail = async (to, donorName, foodName, claimedBy) => {
  return sendEmail({
    to,
    subject: "Your food listing was claimed!",
    html: foodClaimedEmailTemplate(donorName, foodName, claimedBy),
  });
};

module.exports = { sendOTPEmail, sendFoodClaimedEmail, sendVerificationEmail };