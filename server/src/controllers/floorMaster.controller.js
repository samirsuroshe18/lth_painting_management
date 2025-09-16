import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Floor } from '../models/floor.model.js';

const addNewFloor = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || typeof status !== 'boolean') {
        throw new ApiError(400, 'Name and valid status are required fields');
    }

    const newFloor = await Floor.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isFloorCreate = await Floor.findById(newFloor._id);

    if (!isFloorCreate) {
        throw new ApiError(500, 'Failed to create Floor');
    }

    return res.status(201).json(
        new ApiResponse(201, isFloorCreate, 'Floor created successfully')
    );
});

const getAllFloor = catchAsync(async (req, res) => {
    const floor = await Floor.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!floor || floor.length === 0) {
        throw new ApiError(404, 'No Floor available.');
    }

    return res.status(200).json(
        new ApiResponse(200, floor, 'Floor retrieved successfully')
    );
});

const updateFloor = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || status == null) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedFloor = await Floor.findByIdAndUpdate(
        id,
        { name, status, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedFloor) {
        throw new ApiError(404, 'Floor not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedFloor, 'Floor updated successfully')
    );
});

const deleteFloor = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedFloor = await Floor.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedFloor) {
        throw new ApiError(404, "Floor not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedFloor, 'Floor deleted successfully')
    );
});

export {
    addNewFloor,
    getAllFloor,
    updateFloor,
    deleteFloor
};