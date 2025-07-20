import mongoose, { Schema } from 'mongoose';

const AssetAuditLogSchema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },

    auditorRemark: {
        type: String,
        maxlength: 1000,
        default: null
    },

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
}, { timestamps: true });

export const AssetAuditLog = mongoose.model('AssetAuditLog', AssetAuditLogSchema);