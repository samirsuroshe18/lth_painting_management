import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Location } from '../models/location.model.js'; // Assuming you have a Location model

const addNewLocation = catchAsync(async (req, res) => {
    const { name, state, area, status } = req.body;
    if (!name || !state || !area || status==null) {
        throw new ApiError(400, 'Name, state, area, and status are required fields');
    }

    const newLocation = await Location.create({
        name,
        stateId : state,
        area,
        status : status,
        createdBy: req.user.id,
        updatedBy: req.user.id,
    });

    const isExist = await Location.findById(newLocation._id).populate('stateId', 'name');

    if (!isExist) {
        throw new ApiError(500, 'Failed to create new location');
    }

    return res.status(201).json(
        new ApiResponse(201, isExist, 'New location created successfully')
    );

});

const updateLocation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, state, area, status } = req.body;

    if (!name || !state || !area || !status) {
        throw new ApiError(400, 'Name, state, area, and status are required fields');
    }

    const updatedLocation = await Location.findByIdAndUpdate(
        id,
        {
            name,
            stateId: state,
            area,
            status,
            updatedBy: req.user.id,
        },
        { new: true }
    ).populate('stateId', 'name');

    if (!updatedLocation) {
        throw new ApiError(404, 'Location not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedLocation, 'Location updated successfully')
    );
});

const getLocations = catchAsync(async (req, res) => {
    const locations = await Location.find({}).populate('stateId', 'name').sort({createdAt: -1});
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

    return res.status(200).json(
        new ApiResponse(200, {}, 'Location deleted successfully')
    );
});

export {
    addNewLocation,
    updateLocation,
    getLocations,
    deleteLocation
};