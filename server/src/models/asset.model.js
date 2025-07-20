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

    details: {
        type: String,
    },

    currentValue: {
        type: String,
        required: true,
        maxlength: 100,
        default: '0'
    },

    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },

    year: {
        type: Date,
        required: true
    },

    artist: {
        type: String,
        required: true,
    },

    place: {
        type: String,
        required: true,
        maxlength: 100
    },

    size: {
        type: String,
        maxlength: 100,
    },

    status: {
        type: Boolean,
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
    }
}, { timestamps: true });

export const Asset = mongoose.model('Asset', AssetSchema);