import mongoose, { Schema } from 'mongoose';

const StateSchema = new Schema({
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
    }

}, {timestamps: true});

export const State = mongoose.model('State', StateSchema);