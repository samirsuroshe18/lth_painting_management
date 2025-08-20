import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { State } from '../models/state.model.js';

const addNewState = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || typeof status !== 'boolean') {
        throw new ApiError(400, 'Name and valid status are required fields');
    }

    const newState = await State.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isStateCreate = await State.findById(newState._id);

    if (!isStateCreate) {
        throw new ApiError(500, 'Failed to create State');
    }

    return res.status(201).json(
        new ApiResponse(201, isStateCreate, 'State created successfully')
    );
});

const getAllStates = catchAsync(async (req, res) => {
    const states = await State.find({}).sort({ createdAt: -1 });

    if (!states || states.length === 0) {
        throw new ApiError(404, 'No states available.');
    }

    return res.status(200).json(
        new ApiResponse(200, states, 'States retrieved successfully')
    );
});

const updateState = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || status == null) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedState = await State.findByIdAndUpdate(
        id,
        { name, status, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedState) {
        throw new ApiError(404, 'State not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedState, 'State updated successfully')
    );
});

const deleteState = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedState = await State.findByIdAndDelete(id);

    if (!deletedState) {
        throw new ApiError(404, "State not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, 'State deleted successfully')
    );
});

export {
    addNewState,
    getAllStates,
    updateState,
    deleteState
};
