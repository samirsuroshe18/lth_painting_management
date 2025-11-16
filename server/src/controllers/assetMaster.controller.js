import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Asset } from '../models/asset.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import QRCode from 'qrcode'
import mongoose from 'mongoose';
import { config } from '../config/env.js';

const addNewAsset = catchAsync(async (req, res) => {
    const { 
        name, 
        description, 
        purchaseValue, 
        locationId, 
        year, 
        artist,  
        size, 
        status,
        department,
        building,
        floor
    } = req.body;
    
    let imageUrl = null;
    const imagePath = req.file?.path || null;

    const hasAccessToLocation = req.user.location.some(
        (loc) => loc._id.toString() === locationId
    );

    if (!hasAccessToLocation) {
        return res.status(403).json({ message: 'You do not have access to this location.' });
    }

    if (!name || !locationId || !artist || !size || !status ) {
        throw new ApiError(400, 'Please fill in all required fields');
    }

    // if (imagePath) {
    //     const uploadResult = await uploadOnCloudinary(imagePath);
    //     imageUrl = uploadResult.secure_url;
    // }else{
    //     throw new ApiError(400, "Asset Image is missing", imagePath)
    // }

    if (imagePath) {
        imageUrl = `${config.server.baseUrl}/temp/${req.file.filename}`;
    }else{
        throw new ApiError(400, "Asset Image is missing", imagePath)
    }

    const assetData = {
        name,
        image: imageUrl || '',
        locationId,
        artist,
        size,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id,
        reviewStatus: req.user.role !== 'superadmin' ? 'pending' : 'approved',
    };

    if (description) assetData.description = description;
    if (purchaseValue && purchaseValue > 0) assetData.purchaseValue = purchaseValue;
    if (year && year > 0) assetData.year = year;
    if (department) assetData.departmentId = department;
    if (building) assetData.buildingId = building;
    if (floor) assetData.floorId = floor;

    const newAsset = await Asset.create(assetData);

    if (!newAsset) {
        throw new ApiError(500, 'Failed to create asset');
    }

    const qrCodeDataUrl = await QRCode.toDataURL(`${config.qr.dataUrl}${newAsset._id}`);

    if (!qrCodeDataUrl) {
        throw new ApiError(500, 'Failed to generate QR code');
    }

    newAsset.qrCode = qrCodeDataUrl;
    await newAsset.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, newAsset, "Asset created successfully")
    );
});

const viewAsset = catchAsync(async (req, res) => {
    const assetId = req.params.id;
    if (!assetId) {
        throw new ApiError(400, 'Asset ID is required');
    }

    const asset = await Asset.findById(assetId)
        .populate({
            path: "locationId",
            populate: [
                { path: "stateId", select: "name" },
                { path: "cityId", select: "name" },
                { path: "areaId", select: "name" },
            ],
            select: "name stateId cityId areaId"
        })
        .populate("departmentId", "name")
        .populate("buildingId", "name")
        .populate("floorId", "name")
        .populate("createdBy", "userName")
        .populate("updatedBy", "userName");

    if (!asset) {
        throw new ApiError(404, 'Asset not found');
    }

    return res.status(200).json(
        new ApiResponse(200, asset, "Asset retrieved successfully")
    );
});

const viewAssetPublic = catchAsync(async (req, res) => {
    const assetId = req.params.assetId;
    if (!assetId) {
        throw new ApiError(400, 'Asset ID is required');
    }
         
    const asset = await Asset.findOne({ _id: assetId, status: true, reviewStatus: 'approved' })
        .select('-updatedAt -reviewedBy -reviewStatus -status -qrCode -__v')
        .populate({
            path: 'locationId',
            select: 'name area stateId cityId areaId',
            populate: [
                { path: 'stateId', select: 'name' },
                { path: 'cityId', select: 'name' },
                { path: 'areaId', select: 'name' }
            ]
        })
        .populate('departmentId', 'name')
        .populate('buildingId', 'name')
        .populate('floorId', 'name')
        .populate('createdBy', 'userName');

    if (!asset) {
        throw new ApiError(404, 'Asset not found');
    }

    return res.status(200).json(
        new ApiResponse(200, {
            asset,
        }, "Asset retrieved successfully")
    );
});

const updateAsset = catchAsync(async (req, res) => {
    const { assetId } = req.params;
    const { 
        name, 
        locationId, 
        purchaseValue, 
        year, 
        description, 
        artist, 
        size, 
        status,
        department,
        building,
        floor
    } = req.body;
    
    let imageUrl = null;
    const imagePath = req.file?.path || null;

    const hasAccessToLocation = req.user.location.some(
        (loc) => loc._id.toString() === locationId
    );

    if (!hasAccessToLocation) {
        return res.status(403).json({ message: 'You do not have access to this location.' });
    }

    const existingAsset = await Asset.findById(assetId);

    if (!existingAsset) {
        throw new ApiError(404, 'Asset not found');
    }

    if (imagePath) {
        // const uploadResult = await uploadOnCloudinary(imagePath);
        // imageUrl = uploadResult.secure_url;
        imageUrl = `${config.server.baseUrl}/temp/${req.file.filename}`;
    }

    const updateData = {
        updatedBy: req.user._id,
    };

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (purchaseValue !== undefined) updateData.purchaseValue = purchaseValue;
    if (locationId !== undefined) updateData.locationId = locationId;
    if (year !== undefined) updateData.year = year;
    if (artist !== undefined) updateData.artist = artist;
    if (size !== undefined) updateData.size = size;
    if (status !== undefined) updateData.status = status;
    if (imageUrl) updateData.image = imageUrl;
    if (department !== undefined) updateData.departmentId = department;
    if (building !== undefined) updateData.buildingId = building;
    if (floor !== undefined) updateData.floorId = floor;

    const updatedAsset = await Asset.findByIdAndUpdate(
        assetId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).populate('locationId', 'name');

    if (!updatedAsset) {
        throw new ApiError(500, 'Failed to update asset');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedAsset, "Asset updated successfully")
    );
});

const reviewAssetStatus = catchAsync(async (req, res) => {
    const { assetId } = req.params;
    const { reviewStatus, rejectedRemark } = req.body;

    if (!['approved', 'rejected'].includes(reviewStatus)) {
        throw new ApiError(400, 'Invalid status');
    }

    const asset = await Asset.findById(assetId)
        .populate({
            path: 'locationId',
            populate: [
                { path: 'stateId', select: 'name' },
                { path: 'cityId', select: 'name' },
                { path: 'areaId', select: 'name' }
            ]
        })
        .populate('createdBy', 'userName');

    if (!asset) {
        throw new ApiError(404, 'Asset not found');
    }

    const hasAccessToLocation = req.user.location.some(
        (loc) => loc._id.toString() === asset.locationId._id.toString()
    );

    if (!hasAccessToLocation) {
        throw new ApiError(403, 'Access denied.')
    }

    asset.reviewStatus = reviewStatus;
    asset.updatedBy = req.user._id;
    asset.reviewedBy = req.user._id;
    asset.rejectedRemark = rejectedRemark || undefined
    await asset.save();

    return res.status(200).json(
        new ApiResponse(200, asset, 'Asset status updated successfully')
    );
});

const getAssets = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filters = {};

    if (req.query.status) {
        filters.reviewStatus = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);

        filters.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    } else if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        filters.createdAt = { $gte: startDate };
    } else if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filters.createdAt = { $lte: endDate };
    }

    if (req.query.search) {
        filters.$or = [{ name: { $regex: req.query.search, $options: "i" } }];
    }

    const assetMatch = {
        isDeleted: false,
        locationId: { $in: req.user.location.map((loc) => loc._id) },
        ...filters,
    };

    let sort = { createdAt: -1 };
    if (req.query.sortField && req.query.sortOrder) {
        const sortField = req.query.sortField;
        const sortOrder = parseInt(req.query.sortOrder);
        sort = { [sortField]: sortOrder };
    }

    const totalCount = await Asset.countDocuments(assetMatch);
    const totalPages = Math.ceil(totalCount / limit);

    const updatedAsset = await Asset.find(assetMatch)
        .sort(sort)
        .populate({
            path: 'locationId',
            select: 'name area stateId cityId areaId',
            populate: [
                { path: 'stateId', select: 'name' },
                { path: 'cityId', select: 'name' },
                { path: 'areaId', select: 'name' }
            ]
        })
        .populate("departmentId", "name")
        .populate("buildingId", "name")
        .populate("floorId", "name")
        .populate("createdBy", "userName")
        .skip(skip)
        .limit(limit);

    if (updatedAsset.length <= 0) {
        throw new ApiError(404, "No assets available.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                assets: updatedAsset,
                pagination: {
                    totalEntries: totalCount,
                    entriesPerPage: limit,
                    currentPage: page,
                    totalPages: totalPages,
                    hasMore: page < totalPages,
                },
            },
            "Assets retrieved successfully"
        )
    );
});

const getAllAssets = catchAsync(async (req, res) => {
    const assetMatch = {
        isDeleted: false,
        locationId: { $in: req.user.location.map(loc => loc._id) },
    };
    const response = await Asset.find(assetMatch)
        .sort({ createdAt: -1 })
        .populate({
            path: 'locationId',
            populate: [
                {
                    path: 'stateId',
                    select: 'name',
                },
                {
                    path: 'cityId',
                    select: 'name',
                },
                {
                    path: 'areaId',
                    select: 'name',
                },
            ]
        })
        .populate("departmentId", "name")
        .populate("buildingId", "name")
        .populate("floorId", "name")
        .populate('createdBy', 'userName');

    if (response.length <= 0) {
        throw new ApiError(404, "No assets available.");
    }

    return res.status(200).json(
        new ApiResponse(200, response, "Assets retrieved successfully")
    );
});

const getQrCodes = catchAsync(async (req, res) => {
    const response = await Asset.find({
        isDeleted: false,
        locationId: { $in: req.user.location.map(loc => loc._id) },
    })
    .populate('locationId', 'name')
    .populate('departmentId', 'name')
    .populate('buildingId', 'name')
    .populate('floorId', 'name')
    .sort({createdAt: -1});

    if (response.length <= 0) {
        throw new ApiError(404, "QR code not available");
    }

    return res.status(200).json(
        new ApiResponse(200, response, "QR codes retrieved successfully")
    );
});

const removeAsset = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(404, "id is missing");
    }

    const deletedAsset = await Asset.findByIdAndUpdate(
        id,
        {
            isDeleted: true
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!deletedAsset) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Asset Removed Successfully")
    );
})

const getAssetsByLocation = catchAsync(async (req, res) => {
    const { locationIds } = req.body;

    if (!Array.isArray(locationIds) || locationIds.length === 0) {
        throw new ApiError(400, 'locationIds must be a non-empty array');
    }

    const sanitizedLocationIds = locationIds.filter(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id));

    if (sanitizedLocationIds.length === 0) {
        throw new ApiError(400, 'Invalid ID format provided');
    }

    const assets = await Asset.find({
        locationId: { $in: sanitizedLocationIds }
    })
    .populate('departmentId', 'name')
    .populate('buildingId', 'name')
    .populate('floorId', 'name');

    return res.status(200).json(
        new ApiResponse(200, { assets }, "success")
    );
});

export {
    addNewAsset,
    viewAsset,
    updateAsset,
    viewAssetPublic,
    reviewAssetStatus,
    getAssets,
    removeAsset,
    getAssetsByLocation,
    getQrCodes,
    getAllAssets
};