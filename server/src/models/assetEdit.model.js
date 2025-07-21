import mongoose, { Schema } from 'mongoose';

const proposedChangesSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 200,
    },

    image: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
        maxlength: 500
    },

    purchaseValue: {
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
        default: 'N/A'
    },
});

const AssetEditSchema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },

    assetAuditId: {
        type: Schema.Types.ObjectId,
        ref: 'AssetAuditLog',
        required: true
    },

    proposedChanges: proposedChangesSchema,

}, { timestamps: true });

export const AssetEdit = mongoose.model('AssetEdit', AssetEditSchema);