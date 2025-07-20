import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },

    stateId: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },

    area: {
        type: String,
        maxlength: 500,
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
    }
}, { timestamps: true });

export const Location = mongoose.model('Location', LocationSchema);