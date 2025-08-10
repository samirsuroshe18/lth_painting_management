import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Asset } from '../models/asset.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import QRCode from 'qrcode'

const addNewAsset = catchAsync(async (req, res) => {
    const { name, description, purchaseValue, locationId, year, artist, place, size, status } = req.body;
    let imageUrl = null;
    const imagePath = req.file?.path || null;

    const hasAccessToLocation = req.user.location.some(
        (loc) => loc._id.toString() === locationId
    );

    if (!hasAccessToLocation) {
        return res.status(403).json({ message: 'You do not have access to this location.' });
    }

    if (!name || !description || !purchaseValue || !locationId || !year || !artist || !place) {
        throw new ApiError(400, 'All fields are required');
    }

    if (imagePath) {
        const uploadResult = await uploadOnCloudinary(imagePath);
        imageUrl = uploadResult.secure_url;
    }

    const newAsset = await Asset.create({
        name,
        image: imageUrl || 'N/A',
        description,
        purchaseValue,
        locationId,
        year,
        artist,
        place,
        size,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id,
        reviewStatus: req.user.role === 'auditor' ? 'pending' : 'approved',
    });

    if (!newAsset) {
        throw new ApiError(500, 'Failed to create asset');
    }

    const qrCodeDataUrl = await QRCode.toDataURL(`${process.env.QR_CODE_DATA_URL}${newAsset._id}`);

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
    const asset = await Asset.findById(assetId).populate('locationId', 'name')
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

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
        .populate('locationId', 'name')
        .populate('createdBy', 'userName');

    if (!asset) {
        throw new ApiError(404, 'Asset not found');
    }

    return res.status(200).json(
        new ApiResponse(200, asset, "Asset retrieved successfully")
    );
});

const updateAsset = catchAsync(async (req, res) => {
    const { assetId } = req.params;
    const { name, locationId, place, purchaseValue, year, description, artist, size, status } = req.body;
    let imageUrl = null;
    const imagePath = req.file?.path || null;

    const hasAccessToLocation = req.user.location.some(
        (loc) => loc._id.toString() === locationId
    );

    if (!hasAccessToLocation) {
        return res.status(403).json({ message: 'You do not have access to this location.' });
    }

    // Check if asset exists
    const existingAsset = await Asset.findById(assetId);
    if (!existingAsset) {
        throw new ApiError(404, 'Asset not found');
    }

    // Handle image upload if new image is provided
    if (imagePath) {
        const uploadResult = await uploadOnCloudinary(imagePath);
        imageUrl = uploadResult.secure_url;
    }

    // Prepare update object with only provided fields
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
    if (place !== undefined) updateData.place = place;
    if (size !== undefined) updateData.size = size;
    if (status !== undefined) updateData.status = status;
    if (imageUrl) updateData.image = imageUrl;

    // Update the asset
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
    const asset = await Asset.findById(assetId);
    if (!asset) {
        throw new ApiError(404, 'Asset not found');
    }
    const hasAccessToLocation = req.user.location.some(
        (loc) => loc._id.toString() === asset.locationId.toString()
    );

    if (!hasAccessToLocation) {
        return res.status(403).json({ message: 'You do not have access to this location.' });
    }

    if (!['approved', 'rejected'].includes(reviewStatus)) {
        throw new ApiError(400, 'Invalid review status');
    }

    asset.reviewStatus = reviewStatus;
    asset.updatedBy = req.user._id;
    asset.reviewedBy = req.user._id;
    asset.rejectedRemark = rejectedRemark || undefined
    await asset.save();
    return res.status(200).json(
        new ApiResponse(200, {}, 'Asset status updated successfully')
    );
});

const getAssets = catchAsync(async (req, res) => {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter parameters
    const filters = {};

    // Status filter
    if (req.query.status) {
        filters.reviewStatus = req.query.status;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day

        filters.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }

    if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);

        filters.createdAt = {
            $gte: startDate
        };
    }

    if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);

        filters.createdAt = {
            $lte: endDate
        };
    }

    // Name/keyword search
    if (req.query.search) {
        filters.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    // Base match conditions for DeliveryEntry
    const assetMatch = {
        isDeleted: false,
        locationId: { $in: req.user.location.map(loc => loc._id) },
        ...filters
    };

    // Sorting parameters
    let sort = { createdAt: -1 }; // default sort (newest first)
    if (req.query.sortField && req.query.sortOrder) {
        const sortField = req.query.sortField;
        const sortOrder = parseInt(req.query.sortOrder);
        sort = { [sortField]: sortOrder };
    }

    // Count total documents for pagination
    const totalCount = await Asset.countDocuments(assetMatch);
    const totalPages = Math.ceil(totalCount / limit);
    const updatedAsset = await Asset.find(assetMatch)
        .sort(sort)
        .populate('locationId', 'name')
        .populate('createdBy', 'userName');
    // Apply pagination on combined results
    const response = updatedAsset.slice(skip, skip + limit);

    if (response.length <= 0) {
        throw new ApiError(404, "No assets found for the given criteria");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            assets: response,
            pagination: {
                totalEntries: totalCount,
                entriesPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
                hasMore: page < totalPages
            }
        }, "Audit logs retrieved successfully")
    );
});

const removeAsset = catchAsync(async (req, res) => {
    const {id} = req.params;
    if(!id){
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

    if(!deletedAsset){
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Asset Removed Successfully")
    );
})

export {
    addNewAsset,
    viewAsset,
    updateAsset,
    viewAssetPublic,
    reviewAssetStatus,
    getAssets,
    removeAsset
};