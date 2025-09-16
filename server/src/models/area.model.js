import mongoose, { Schema } from 'mongoose';

const AreaSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    
    status: {
        type: Boolean,
        default: true,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

}, {timestamps: true});

export const Area = mongoose.model('Area', AreaSchema);