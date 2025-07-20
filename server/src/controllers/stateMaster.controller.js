import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import {State} from '../models/state.model.js';

const addNewState = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status are required fields');
    }

    // Assuming we have a State model to interact with the database
    const newState = await State.create({ 
        name, 
        status,
    });
    
    if (!newState) {
        throw new ApiError(500, 'Failed to create new state');
    }

    return res.status(201).json(
        new ApiResponse(201, newState, 'New state created successfully')
    );
});

export {
    addNewState,
};