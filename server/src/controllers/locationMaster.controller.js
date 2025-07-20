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
        status,
    });

    if (!newLocation) {
        throw new ApiError(500, 'Failed to create new location');
    }

    return res.status(201).json(
        new ApiResponse(201, newLocation, 'New location created successfully')
    );

});

export {
    addNewLocation,
};