import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import mailSender from '../utils/mailSender.js';
import { User } from '../models/user.model.js';
import jwt from "jsonwebtoken";
import { config } from '../config/env.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        // when we use save() method is used then all the fields are neccesary so to avoid that we have to pass an object with property {validatBeforeSave:false}
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const loginUser = catchAsync(async (req, res) => {
    const { email, password, isRemember } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
        throw new ApiError(404, "Invalid credential");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credential");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been deactivated.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    user.lastLogin = new Date();
    user.isLoggedIn = true;
    user.isRemember = isRemember;
    await user.save({ validateBeforeSave: false });

    // Create cookie options object
    const option = {
        httpOnly: config.cookie.httpOnly === 'true',
        secure: config.isProd === 'production',
        maxAge: isRemember ? config.cookie.maxAge : undefined,
        sameSite: config.cookie.sameSite === 'true' ? 'Strict' : 'Lax',
    };

    return res.status(200).cookie('accessToken', accessToken, option).cookie('refreshToken', refreshToken, option).json(
        new ApiResponse(200, {
            user,
            accessToken,
            refreshToken
        }, "User logged in successfully")
    );
});

const logoutUser = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    // Cookie options
    const option = {
        httpOnly: config.cookie.httpOnly === 'true',
        secure: config.isProd === 'production',
        sameSite: config.cookie.sameSite === 'true' ? 'Strict' : 'Lax',
    }

    try {
        // Only update database if refresh token exists
        if (refreshToken) {
            await User.findOneAndUpdate(
                { refreshToken: refreshToken },
                {
                    $unset: {
                        refreshToken: 1,
                    },
                    $set: {
                        isLoggedIn: false,
                        lastLogout: new Date(),
                        isRemember: false,
                    }
                },
                { new: true }
            );
        }
    } catch (error) {
        // Log error but don't fail logout
        console.error('Database update failed during logout:', error);
    }

    // Always clear cookies regardless of database operation result
    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = catchAsync(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, {user: req.user}, "Current user fetched successfully")
    );
});

const refreshAccessToken = catchAsync(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken || incomingRefreshToken === "null" || incomingRefreshToken === "undefined") {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(incomingRefreshToken, config.jwt.refreshSecret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, "Refresh token is expired");
        }
        throw new ApiError(403, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const option = {
        httpOnly: config.cookie.httpOnly === 'true',
        secure: config.isProd === 'production',
        maxAge: user?.isRemember ? config.cookie.maxAge : undefined,
        sameSite: config.cookie.sameSite === 'true' ? 'Strict' : 'Lax',
    };

    const { accessToken } = await generateAccessAndRefreshToken(user._id);

    return res
        .status(200)
        .cookie('accessToken', accessToken, option)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

const changeCurrentPassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "Invalid email or email is not verified");
    }

    const mailResponse = await mailSender(email, "RESET", undefined, user._id);

    if (mailResponse) {
        return res.status(200).json(
            new ApiResponse(200, {}, "An email sent to your account please reset your password in 10 minutes")
        );
    }

    throw new ApiError(500, "Something went wrong!! An email couldn't sent to your account");
});

export {
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    changeCurrentPassword,
    forgotPassword
};
