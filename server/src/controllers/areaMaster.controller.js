import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Area } from '../models/area.model.js';

const addNewArea = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || typeof status !== 'boolean') {
        throw new ApiError(400, 'Name and valid status are required fields');
    }

    const newArea = await Area.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isAreaCreate = await Area.findById(newArea._id);

    if (!isAreaCreate) {
        throw new ApiError(500, 'Failed to create Area');
    }

    return res.status(201).json(
        new ApiResponse(201, isAreaCreate, 'Area created successfully')
    );
});

const getAllAreas = catchAsync(async (req, res) => {
    const areas = await Area.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!areas || areas.length === 0) {
        throw new ApiError(404, 'No area available.');
    }

    return res.status(200).json(
        new ApiResponse(200, areas, 'Area retrieved successfully')
    );
});

const updateArea = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || status == null) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedArea = await Area.findByIdAndUpdate(
        id,
        { name, status, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedArea) {
        throw new ApiError(404, 'Area not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedArea, 'Area updated successfully')
    );
});

const deleteArea = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedArea = await Area.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedArea) {
        throw new ApiError(404, "Area not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedArea, 'Area deleted successfully')
    );
});

export {
    addNewArea,
    getAllAreas,
    updateArea,
    deleteArea
};