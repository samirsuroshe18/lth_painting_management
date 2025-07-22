import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

const verifyJwt = catchAsync(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token || token === "null" || token === "undefined") {
        throw new ApiError(400, "Access token not provided");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Access token expired");
        } else {
            throw new ApiError(403, "Invalid access token");
        }
    }

    const user = await User.findById(decodedToken?._id)
        .select('-password -refreshToken -__v')
        .populate({
            path: 'location',
            populate: [
                {
                    path: 'stateId',
                    populate: [
                        {
                            path: 'createdBy',
                            model: 'User',
                            select: '-password -refreshToken -__v'
                        },
                        {
                            path: 'updatedBy',
                            model: 'User',
                            select: '-password -refreshToken -__v'
                        }
                    ]
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: '-password -refreshToken -__v'
                },
                {
                    path: 'updatedBy',
                    model: 'User',
                    select: '-password -refreshToken -__v'
                }
            ]
        })
        .populate({
            path: 'createdBy',
            select: '-password -refreshToken -__v'
        })
        .populate({
            path: 'updatedBy',
            select: '-password -refreshToken -__v'
        });

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been deactivated.");
    }

    req.user = user;
    next();
})

export { verifyJwt };