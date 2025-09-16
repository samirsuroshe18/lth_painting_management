import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Department } from '../models/department.model.js';

const addNewDepartment = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || typeof status !== 'boolean') {
        throw new ApiError(400, 'Name and valid status are required fields');
    }

    const newDepartment = await Department.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isDepartmentCreate = await Department.findById(newDepartment._id);

    if (!isDepartmentCreate) {
        throw new ApiError(500, 'Failed to create Department');
    }

    return res.status(201).json(
        new ApiResponse(201, isDepartmentCreate, 'Department created successfully')
    );
});

const getAllDepartment = catchAsync(async (req, res) => {
    const departments = await Department.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!departments || departments.length === 0) {
        throw new ApiError(404, 'No Department available.');
    }

    return res.status(200).json(
        new ApiResponse(200, departments, 'Department retrieved successfully')
    );
});

const updateDepartment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || status == null) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
        id,
        { name, status, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedDepartment) {
        throw new ApiError(404, 'Department not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedDepartment, 'Department updated successfully')
    );
});

const deleteDepartment = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedDepartment = await Department.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedDepartment) {
        throw new ApiError(404, "Department not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedDepartment, 'Department deleted successfully')
    );
});

export {
    addNewDepartment,
    getAllDepartment,
    updateDepartment,
    deleteDepartment
};