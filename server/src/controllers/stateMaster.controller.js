import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { State } from '../models/state.model.js';

const addNewState = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status are required fields');
    }

    // Assuming we have a State model to interact with the database
    const newState = await State.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isStateCreate = await State.findById(newState._id)
        .lean()
        .select('-__v')
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!isStateCreate) {
        throw new ApiError(500, 'Failed to create new state');
    }

    return res.status(201).json(
        new ApiResponse(201, isStateCreate, 'New state created successfully')
    );
});

const getAllStates = catchAsync(async (req, res) => {
    const states = await State.find()
        .lean()
        .select('-__v')
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!states || states.length === 0) {
        throw new ApiError(404, 'No states found');
    }
    return res.status(200).json(
        new ApiResponse(200, states, 'States retrieved successfully')
    );
});

const updateState = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
        throw new ApiError(400, 'Status must be either active or inactive');
    }

    if (!name) {
        throw new ApiError(400, 'Name is a required field');
    }

    const updatedState = await State.findByIdAndUpdate(
        id,
        { name, status: status === 'active' ? true : false, updatedBy: req.user._id },
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

export {
    addNewState,
    getAllStates,
    updateState
};