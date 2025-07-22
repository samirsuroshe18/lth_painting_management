import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { State } from '../models/state.model.js';

// For adding a new state
const addNewState = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status are required fields');
    }

    const newState = await State.create({ name, status });

    if (!newState) {
        throw new ApiError(500, 'Failed to create new state');
    }

    return res.status(201).json(
        new ApiResponse(201, newState, 'New state created successfully')
    );
});
//For fetching all states
const getAllStates = catchAsync(async (req, res) => {
    const states = await State.find();

    if (!states || states.length === 0) {
        throw new ApiError(404, 'No states found');
    }

    return res.status(200).json(
        new ApiResponse(200, states, 'Fetched all states successfully')
    );
});

// For updating an existing state
const updateState = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    const updatedState = await State.findByIdAndUpdate(
        id,
        { name, status },
        { new: true, runValidators: true }
    );

    if (!updatedState) {
        throw new ApiError(404, 'State not found or failed to update');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedState, 'State updated successfully')
    );
});

export {
    addNewState,
    getAllStates,
    updateState, 
};
