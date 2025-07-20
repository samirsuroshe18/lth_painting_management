import { User } from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';

const resetPassword = catchAsync(async (req, res) => {
  const token = req.query.token;
    const user = await User.findOne({ forgotPasswordToken: token, forgotPasswordTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.render("invalidForgotLink")
    }

    return res.render("forgotPasswordSuccess", {
      apiBaseUrl: process.env.BASE_URL
    });
})

const verifyPassword = catchAsync(async (req, res) => {
  const token = req.query.token;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new ApiError(400, "Password do not match");
    }

    const user = await User.findOne({ forgotPasswordToken: token, forgotPasswordTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      throw new ApiError(500, "Invalid or expired token");
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    user.password = password
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, {}, "Password reset successful")
    );
});

export { resetPassword, verifyPassword }