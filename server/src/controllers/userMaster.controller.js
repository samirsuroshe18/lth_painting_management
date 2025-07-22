import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { User } from '../models/user.model.js';
import mailSender from '../utils/mailSender.js';
import getAccessByRole from '../config/getAccessByRole.js';

const createUser = catchAsync(async (req, res) => {
    const { userName, email, mobileNo, location, password, role, status } = req.body;

    if (!userName || !email || !mobileNo || !password || !role) {
        throw new ApiError(400, "All fields are required"); 
    }

    const user = await User.create({
        userName,
        email,
        password,
        mobileNo,
        location,
        role,
        permissions: getAccessByRole(role),
        isActive: status,
    });

    const createdUser = await User.findById(user._id);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    const mailResponse = await mailSender(email, role, password);

    if (mailResponse) {
        return res.status(200).json(
            new ApiResponse(200, createdUser, "Sector Admin created successfully. An email has been sent to the user with login credentials.")
        );
    }

    throw new ApiError(500, "Something went wrong!! An email couldn't be sent to your account");
});

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export {
    createUser,
    getAllUsers
};
