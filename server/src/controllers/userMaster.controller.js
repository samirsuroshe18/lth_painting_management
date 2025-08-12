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
        isActive: status === 'active' ? true : false,
    });

    const createdUser = await User.findById(user._id);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    const mailResponse = await mailSender(email, role, password);

    if (!mailResponse) {
        console.log("Something went wrong!! An email couldn't sent to your account");
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "Account created successfully. An email has been sent to the user with login credentials.")
    );
});

const getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find({}).find({ role: { $ne: 'superadmin' }, isDeleted:false })
        .select('-password -__v')
        .sort({ createdAt: -1 })
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
    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found");
    }
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

const updateUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { userName, email, mobileNo, location, role, status } = req.body;

    if (!userName || !email || !mobileNo || !role || !status || location === undefined) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(userId, {
        userName,
        email,
        mobileNo,
        role,
        location,
        isActive: status === 'active' ? true : false,
        location,
        updatedBy: req.user._id
    }, { new: true })
        .select('-password -__v')
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
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

const removeUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(404, "id is missing");
    }

    const deletedUser = await User.findByIdAndUpdate(
        id,
        {
            isDeleted: true
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!deletedUser) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "User Removed Successfully")
    );
})

const fetchUser = catchAsync(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(userId)
        .select('-password -__v')
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
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const updatePermissions = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!userId || !Array.isArray(permissions)) {
        throw new ApiError(400, "User ID and permissions array are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { permissions },
        { new: true }
    ).select('-password -__v');

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Permissions updated successfully")
    );
});

const ACTION_MAP = [
  "allAccess",
  "dashboard:view",
  "dashboard:edit",
  "masters:view",
  "masters:edit",
  "userMaster:view",
  "userMaster:edit",
  "roleMaster:view",
  "roleMaster:edit",
  "assetMaster:view",
  "assetMaster:edit",
  "locationMaster:view",
  "locationMaster:edit",
  "stateMaster:view",
  "stateMaster:edit",
  "generateQrCode",
  "auditReport:view",
  "auditReport:edit",
];

const updateAllUsersIsDelete = async (req, res) => {
  try {
    await User.updateMany(
      {}, // no filter = all documents
      { $set: { isDeleted: false } }
    );

    res.json({ message: "isDelete set to false for all users" });
  } catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export {
    createUser,
    getAllUsers,
    updateUser,
    fetchUser,
    updatePermissions,
    updateAllUsersIsDelete,
    removeUser
};
