import mongoose, { Schema } from 'mongoose';

const AssetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 200,
    },

    image: {
        type: String,
        required: true,
    },

    qrCode: {
        type: String,
        default: 'N/A',
    },

    description: {
        type: String,
        required: false,
        maxlength: 500,
        default: ''
    },

    purchaseValue: {
        type: Number,
        required: false,
    },

    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },

    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: false
    },

    buildingId: {
        type: Schema.Types.ObjectId,
        ref: 'Building',
        required: false
    },

    floorId: {
        type: Schema.Types.ObjectId,
        ref: 'Floor',
        required: false
    },

    year: {
        type: Number,
        required: false,
    },

    artist: {
        type: String,
        required: true,
    },

    size: {
        type: String,
        required: true,
        maxlength: 100,
    },

    status: {
        type: Boolean,
        required: true,
        default: true,
    },

    reviewStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: "pending"
    },

    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    rejectedRemark: {
        type: String,
        maxlength: 1000,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export const Asset = mongoose.model('Asset', AssetSchema);