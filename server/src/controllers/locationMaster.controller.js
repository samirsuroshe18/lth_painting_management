import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Location } from '../models/location.model.js'; // Assuming you have a Location model

const addNewLocation = catchAsync(async (req, res) => {
    const { name, state, area, status } = req.body;
    if (!name || !state || !area || !status) {
        throw new ApiError(400, 'Name, state, area, and status are required fields');
    }

    const newLocation = await Location.create({
        name,
        stateId : state,
        area,
        status : status=== 'active' ? true : false,
        createdBy: req.user.id,
        updatedBy: req.user.id,
    });

    if (!newLocation) {
        throw new ApiError(500, 'Failed to create new location');
    }

    return res.status(201).json(
        new ApiResponse(201, newLocation, 'New location created successfully')
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
            status: status === 'active' ? true : false,
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
    const locations = await Location.find().populate('stateId', 'name');
    return res.status(200).json(
        new ApiResponse(200, locations, 'Locations retrieved successfully')
    );
});

export {
    addNewLocation,
    updateLocation,
    getLocations
};