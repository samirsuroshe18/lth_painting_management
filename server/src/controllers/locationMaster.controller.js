import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Location } from '../models/location.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

const addNewLocation = catchAsync(async (req, res) => {
    const { name, state, city, area, status } = req.body;
    if (!name || !state || !area || status == null) {
        throw new ApiError(400, 'Name, state, area, and status are required fields');
    }

    const newLocation = await Location.create({
        name,
        stateId: state,
        cityId: city,
        areaId: area,
        status: status === "active" ? true : false,
        createdBy: req.user._id,
        updatedBy: req.user._id,
    });

    const isExist = await Location.findById(newLocation._id)
        .populate('stateId', 'name')
        .populate('cityId', 'name')
        .populate('areaId', 'name');

    if (!isExist) {
        throw new ApiError(500, 'Failed to create location');
    }

    await User.updateOne(
        { role: "superadmin" },
        { $push: { location: newLocation._id } }
    );

    return res.status(201).json(
        new ApiResponse(201, isExist, 'Location created successfully')
    );
});

const updateLocation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, state, city, area, status } = req.body;

    if (!name || !state || !area || !status) {
        throw new ApiError(400, 'Name, state, area, and status are required fields');
    }

    const updatedLocation = await Location.findByIdAndUpdate(
        id,
        {
            name,
            stateId: state,
            cityId: city,
            areaId: area,
            status: status === "active" ? true : false,
            updatedBy: req.user._id,
        },
        { new: true }
    )
        .populate('stateId', 'name')
        .populate('cityId', 'name')
        .populate('areaId', 'name');

    if (!updatedLocation) {
        throw new ApiError(404, 'Location not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedLocation, 'Location updated successfully')
    );
});

const getLocations = catchAsync(async (req, res) => {
    const locations = await Location.find({})
        .populate('stateId', 'name')
        .populate('cityId', 'name')
        .populate('areaId', 'name')
        .sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, locations, 'Locations retrieved successfully')
    );
});

const deleteLocation = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedState = await Location.findByIdAndDelete(id);

    if (!deletedState) {
        throw new ApiError(404, "Location not found");
    }

    if (req.user.role == "superadmin") {
        await User.updateMany(
            {},
            { $pull: { location: id } }
        );
    }

    return res.status(200).json(
        new ApiResponse(200, {}, 'Location deleted successfully')
    );
});

const addLocationToSuperAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Location ID is required');
    }

    const result = await User.updateOne(
        { role: "superadmin" },
        { $addToSet: { location: mongoose.Types.ObjectId.createFromHexString(id) } }
    );

    if (result.modifiedCount === 0) {
        throw new ApiError(500, 'Failed to add location to superadmin');
    }

    return res.status(200).json(
        new ApiResponse(200, {}, 'Location added to superadmin successfully')
    );
});

export {
    addNewLocation,
    updateLocation,
    getLocations,
    deleteLocation,
    addLocationToSuperAdmin
};