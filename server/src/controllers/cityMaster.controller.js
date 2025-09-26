import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { City } from '../models/city.model.js';

const addNewCity = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status are required fields');
    }

    const newCity = await City.create({
        name,
        status:status==="active"?true:false,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isCityCreate = await City.findById(newCity._id);

    if (!isCityCreate) {
        throw new ApiError(500, 'Failed to create City');
    }

    return res.status(201).json(
        new ApiResponse(201, isCityCreate, 'City created successfully')
    );
});

const getAllCities = catchAsync(async (req, res) => {
    const cities = await City.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!cities || cities.length === 0) {
        throw new ApiError(404, 'No city available.');
    }

    return res.status(200).json(
        new ApiResponse(200, cities, 'City retrieved successfully')
    );
});

const updateCity = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedCity = await City.findByIdAndUpdate(
        id,
        { name, status:status==="active"?true:false, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedCity) {
        throw new ApiError(404, 'City not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedCity, 'City updated successfully')
    );
});

const deleteCity = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedCity = await City.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedCity) {
        throw new ApiError(404, "City not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedCity, 'City deleted successfully')
    );
});

export {
    addNewCity,
    getAllCities,
    updateCity,
    deleteCity
};
