import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Asset } from '../models/asset.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { AssetAuditLog } from '../models/assetAuditLog.model.js';
import { User } from '../models/user.model.js';
import { Location } from '../models/location.model.js';
import mongoose from 'mongoose';

// To add a new asset audit
const addNewAssetAudit = catchAsync(async (req, res) => {
    const { assetId, auditorRemark, proposedChanges } = req.body;
    const files = req.files || {};
    const assetImagePath = files['assetImage']?.[0]?.path || null;
    const auditImagePath1 = files['auditImage1']?.[0]?.path || null;
    const auditImagePath2 = files['auditImage2']?.[0]?.path || null;
    const auditImagePath3 = files['auditImage3']?.[0]?.path || null;
    let proposedChangesData = null;
    let assetImage = null;
    let auditImage1 = null;
    let auditImage2 = null;
    let auditImage3 = null;

    const asset = await Asset.findById(assetId);
    if (!asset) {
        throw new ApiError(404, 'Asset not found');
    }

    if (!assetId || !auditorRemark || !auditImagePath1) {
        throw new ApiError(400, 'Auditor remark and at least one audit image are required');
    }

    if (proposedChanges || assetImagePath) {
        proposedChangesData = proposedChanges ? JSON.parse(proposedChanges) : {};
        if (assetImagePath) {
            const uploadResult = await uploadOnCloudinary(assetImagePath);
            assetImage = uploadResult.secure_url;
        }
        proposedChangesData.image = assetImage || undefined;
    }

    if (auditImagePath1) {
        const uploadResult = await uploadOnCloudinary(auditImagePath1);
        auditImage1 = uploadResult.secure_url;
    }

    if (auditImagePath2) {
        const uploadResult = await uploadOnCloudinary(auditImagePath2);
        auditImage2 = uploadResult.secure_url;
    }

    if (auditImagePath3) {
        const uploadResult = await uploadOnCloudinary(auditImagePath3);
        auditImage3 = uploadResult.secure_url;
    }

    const auditData = {
        assetId,
        locationId: asset.locationId,
        auditorRemark,
        attachmentOne: auditImage1,
        auditStatus: true,
        reviewStatus: 'pending',
        createdBy: req.user._id,
        updatedBy: req.user._id,
        ...(proposedChangesData && { proposedChanges: proposedChangesData }),
        ...(auditImage2 && { attachmentTwo: auditImage2 }),
        ...(auditImage3 && { attachmentThree: auditImage3 }),
    };

    const newAssetAudit = await AssetAuditLog.create(auditData);

    if (!newAssetAudit) {
        throw new ApiError(500, 'Failed to create asset audit');
    }

    return res.status(200).json(
        new ApiResponse(200, {}, 'Asset audit created successfully')
    );
});

// To review the audit status
const reviewAuditStatus = catchAsync(async (req, res) => {
    const { auditId } = req.params;
    const { reviewStatus, rejectedRemark } = req.body;

    const audit = await AssetAuditLog.findById(auditId);
    if (!audit) throw new ApiError(404, 'Audit not found');

    if (!['approved', 'rejected'].includes(reviewStatus)) {
        throw new ApiError(400, 'Invalid review status');
    }

    if (reviewStatus === 'rejected') {
        if (!rejectedRemark) throw new ApiError(400, 'Rejected remark is required for rejection');
        audit.reviewStatus = 'rejected';
        audit.rejectedRemark = rejectedRemark;
        audit.updatedBy = req.user._id;
        await audit.save();
        return res.status(200).json(new ApiResponse(200, {}, 'Audit status updated successfully'));
    }

    // If approved
    const updateData = { updatedBy: req.user._id };
    const fields = ['name', 'description', 'purchaseValue', 'year', 'artist', 'place', 'size', 'image'];

    fields.forEach(field => {
        if (audit?.proposedChanges?.[field]) {
            updateData[field] = audit.proposedChanges[field];
        }
    });

    if (audit?.proposedChanges?.location) {
        updateData.locationId = audit.proposedChanges.location;
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
        audit.assetId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedAsset) throw new ApiError(500, 'Failed to update asset');

    audit.reviewStatus = 'approved';
    audit.rejectedRemark = null;
    audit.updatedBy = req.user._id;
    await audit.save();

    return res.status(200).json(new ApiResponse(200, updatedAsset, 'Audit approved and asset updated successfully'));
});

// To get all audit logs with pagination and filtering
const getAuditLogs = catchAsync(async (req, res) => {
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
            { auditorRemark: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    // Base match conditions for DeliveryEntry
    const assetAuditMatch = {
        locationId: { $in: req.user.location.map(loc => loc._id) },
        ...filters
    };

    // Count total documents for pagination
    const totalCount = await AssetAuditLog.countDocuments(assetAuditMatch);
    const totalPages = Math.ceil(totalCount / limit);
    const updatedAssetAudit = await AssetAuditLog.find(assetAuditMatch)
        .populate({
            path: 'proposedChanges.locationId',
            model: 'Location',
            select: 'name',
            strictPopulate: false
        })
        .populate({
            path: 'assetId',
            populate: [
                {
                    path: 'locationId',
                    populate: [
                        {
                            path: 'stateId',
                            select: 'name',
                        },
                    ]
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'userName'
                },
                {
                    path: 'updatedBy',
                    model: 'User',
                    select: 'userName'
                }
            ]
        })
        .populate({
            path: 'locationId',
            select: 'name',
        })
        .populate({
            path: 'proposedChanges.location',
            select: 'name',
        })
        .populate({
            path: 'createdBy',
            select: 'userName',
        })
        .sort({ createdAt: -1 });

    // Apply pagination on combined results
    const response = updatedAssetAudit.slice(skip, skip + limit);

    if (response.length <= 0) {
        throw new ApiError(404, "No entries found matching your criteria");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            auditLogs: response,
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

// To get all audit logs with pagination and filtering
const fetchAllAuditLogs = catchAsync(async (req, res) => {
    const assetAuditMatch = {
        locationId: { $in: req.user.location.map(loc => loc._id) },
    };

    const updatedAssetAudit = await AssetAuditLog.find(assetAuditMatch)
        .populate({
            path: 'proposedChanges.locationId',
            model: 'Location',
            select: 'name',
            strictPopulate: false
        })
        .populate({
            path: 'assetId',
            populate: [
                {
                    path: 'locationId',
                    populate: [
                        {
                            path: 'stateId',
                            select: 'name',
                        },
                    ]
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'userName'
                },
                {
                    path: 'updatedBy',
                    model: 'User',
                    select: 'userName'
                }
            ]
        })
        .populate({
            path: 'locationId',
            select: 'name',
        })
        .populate({
            path: 'proposedChanges.location',
            select: 'name',
        })
        .populate({
            path: 'createdBy',
            select: 'userName',
        })
        .populate({
            path: 'updatedBy',
            select: 'userName',
        })
        .sort({ createdAt: -1 });

    if (updatedAssetAudit.length <= 0) {
        throw new ApiError(404, "No entries found matching your criteria");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedAssetAudit, "Audit logs retrieved successfully")
    );
});

// To view all audit logs for a specific asset
const getAssetAuditLogs = catchAsync(async (req, res) => {
    const { assetId } = req.params;

    // Base match conditions for DeliveryEntry
    const assetAuditMatch = {
        assetId,
        locationId: { $in: req.user.location.map(loc => loc._id) }
    };

    const updatedAssetAudit = await AssetAuditLog.find(assetAuditMatch)
        .populate({
            path: 'proposedChanges.locationId',
            model: 'Location',
            select: 'name',
            strictPopulate: false
        })
        .populate({
            path: 'assetId',
            populate: [
                {
                    path: 'locationId',
                    populate: [
                        {
                            path: 'stateId',
                            select: 'name',
                        },
                    ]
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'userName'
                },
                {
                    path: 'updatedBy',
                    model: 'User',
                    select: 'userName'
                }
            ]
        })
        .populate({
            path: 'locationId',
            select: 'name',
        })
        .populate({
            path: 'proposedChanges.location',
            select: 'name',
        })
        .populate({
            path: 'createdBy',
            select: 'userName',
        })
        .sort({ createdAt: -1 });

    if (updatedAssetAudit.length <= 0) {
        throw new ApiError(404, "No entries found matching your criteria");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedAssetAudit, "Audit logs retrieved successfully")
    );
});

// To view a specific audit log by ID
const viewAuditLog = catchAsync(async (req, res) => {
    const { auditId } = req.params;

    const auditLog = await AssetAuditLog.findById(auditId)
        .populate({
            path: 'proposedChanges.locationId',
            model: 'Location',
            select: 'name',
            strictPopulate: false
        })
        .populate({
            path: 'assetId',
            populate: [
                {
                    path: 'locationId',
                    select: 'name',
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'userName'
                },
                {
                    path: 'updatedBy',
                    model: 'User',
                    select: 'userName'
                }
            ]
        })
        .populate({
            path: 'locationId',
            select: 'name',
        });

    if (!auditLog) {
        throw new ApiError(404, 'Audit log not found');
    }
    return res.status(200).json(
        new ApiResponse(200, auditLog, 'Audit log retrieved successfully')
    );
});

const fetchAudits = catchAsync(async (req, res) => {
    const { locationIds, assetIds, startDate, endDate } = req.body;

    if (!Array.isArray(locationIds) || locationIds.length === 0) {
        throw new ApiError(400, 'locationIds must be a non-empty array');
    }

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
        throw new ApiError(400, 'locationIds must be a non-empty array');
    }

    if (!startDate || !endDate) {
        throw new ApiError(400, 'Both startDate and endDate are required');
    }

    // Build the query object dynamically
    const query = {
        locationId: { $in: locationIds },
        assetId: { $in: assetIds },
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };

    const audits = await AssetAuditLog.find(query).populate({
        path: 'proposedChanges.locationId',
        model: 'Location',
        select: 'name',
        strictPopulate: false
    })
        .populate({
            path: 'assetId',
            populate: [
                {
                    path: 'locationId',
                    populate: [
                        {
                            path: 'stateId',
                            select: 'name',
                        },
                    ]
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'userName'
                },
                {
                    path: 'updatedBy',
                    model: 'User',
                    select: 'userName'
                }
            ]
        })
        .populate({
            path: 'locationId',
            select: 'name',
        })
        .populate({
            path: 'proposedChanges.location',
            select: 'name',
        })
        .populate({
            path: 'createdBy',
            select: 'userName',
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { audits }, 'Success')
    );
});


export {
    addNewAssetAudit,
    reviewAuditStatus,
    getAuditLogs,
    fetchAllAuditLogs,
    getAssetAuditLogs,
    viewAuditLog,
    fetchAudits,
};