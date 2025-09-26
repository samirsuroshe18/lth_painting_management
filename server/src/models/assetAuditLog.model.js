import mongoose, { Schema } from 'mongoose';

const proposedChangesSchema = new Schema({
    name: {
        type: String,
        maxlength: 200,
    },

    image: {
        type: String,
    },

    description: {
        type: String,
        maxlength: 500
    },

    purchaseValue: {
        type: String,
        maxlength: 100,
    },

    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
    },

    year: {
        type: Number,
    },

    artist: {
        type: String,
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

    size: {
        type: String,
        maxlength: 100,
    },
});

const AssetAuditLogSchema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },

    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },

    auditorRemark: {
        type: String,
        maxlength: 1000,
        default: null
    },

    proposedChanges: proposedChangesSchema,

    attachmentOne: {
        type: String,
    },

    attachmentTwo: {
        type: String,
    },

    attachmentThree: {
        type: String,
    },

    auditStatus: {
        type: Boolean,
        default: true
    },

    reviewStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: "pending"
    },

    rejectedRemark: {
        type: String,
        maxlength: 1000,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });

export const AssetAuditLog = mongoose.model('AssetAuditLog', AssetAuditLogSchema);