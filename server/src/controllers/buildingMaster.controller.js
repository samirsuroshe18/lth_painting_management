import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Building } from '../models/building.model.js';

const addNewBuilding = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || typeof status !== 'boolean') {
        throw new ApiError(400, 'Name and valid status are required fields');
    }

    const newBuilding = await Building.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isBuildingCreate = await Building.findById(newBuilding._id);

    if (!isBuildingCreate) {
        throw new ApiError(500, 'Failed to create Building');
    }

    return res.status(201).json(
        new ApiResponse(201, isBuildingCreate, 'Building created successfully')
    );
});

const getAllBuilding = catchAsync(async (req, res) => {
    const building = await Building.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!building || building.length === 0) {
        throw new ApiError(404, 'No Building available.');
    }

    return res.status(200).json(
        new ApiResponse(200, building, 'Building retrieved successfully')
    );
});

const updateBuilding = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || status == null) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedBuilding = await Building.findByIdAndUpdate(
        id,
        { name, status, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedBuilding) {
        throw new ApiError(404, 'Building not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedBuilding, 'Building updated successfully')
    );
});

const deleteBuilding = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedBuilding = await Building.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedBuilding) {
        throw new ApiError(404, "Building not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedBuilding, 'Building deleted successfully')
    );
});

export {
    addNewBuilding,
    getAllBuilding,
    updateBuilding,
    deleteBuilding
};