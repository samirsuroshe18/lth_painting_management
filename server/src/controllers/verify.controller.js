import { User } from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { config } from '../config/env.js';

// Helper function to validate and sanitize reset token
const validateResetToken = (token) => {
  if (!token) {
    throw new ApiError(400, 'Reset token is required');
  }

  // Ensure token is a string and trim whitespace
  const sanitizedToken = token.toString().trim();

  if (sanitizedToken.length === 0) {
    throw new ApiError(400, 'Invalid reset token format');
  }

  // Bcrypt hash format validation
  // Bcrypt hashes have format: $2a$10$[22 character salt][31 character hash]
  const bcryptRegex = /^\$2[abyxy]?\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;

  if (!bcryptRegex.test(sanitizedToken)) {
    throw new ApiError(400, 'Invalid reset token format');
  }

  // Bcrypt hashes are typically 60 characters
  if (sanitizedToken.length < 59 || sanitizedToken.length > 61) {
    throw new ApiError(400, 'Invalid reset token format');
  }

  return sanitizedToken;
};

// Helper function to validate password
const validatePassword = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    throw new ApiError(400, 'Password and confirm password are required');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  // Password strength validation
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }

  // Additional password strength checks
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
  //   throw new ApiError(400, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
  // }

  return password;
};

const resetPassword = catchAsync(async (req, res) => {
  const token = req.query.token;

  // Validate and sanitize the reset token
  let validatedToken;
  try {
    validatedToken = validateResetToken(token);
  } catch (error) {
    return res.render("invalidForgotLink");
  }

  // Build secure query with validated token
  const query = {
    forgotPasswordToken: validatedToken,
    forgotPasswordTokenExpiry: { $gt: new Date() }
  };

  const user = await User.findOne(query);
  if (!user) {
    return res.render("invalidForgotLink");
  }

  return res.render("forgotPasswordSuccess", {
    apiBaseUrl: config.server.baseUrl
  });
});

const verifyPassword = catchAsync(async (req, res) => {
  const token = req.query.token;
  const { password, confirmPassword } = req.body;

  // Validate and sanitize the reset token
  const validatedToken = validateResetToken(token);

  // Validate password
  const validatedPassword = validatePassword(password, confirmPassword);

  // Build secure query with validated token
  const query = {
    forgotPasswordToken: validatedToken,
    forgotPasswordTokenExpiry: { $gt: new Date() }
  };

  const user = await User.findOne(query);
  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // Clear reset token fields and update password
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  user.password = validatedPassword;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successful")
  );
});

export { resetPassword, verifyPassword };