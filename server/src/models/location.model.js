import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        maxlength: 255
    },

    stateId: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },

    cityId: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },

    areaId: {
        type: Schema.Types.ObjectId,
        ref: 'Area',
        required: true
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