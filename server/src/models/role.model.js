import mongoose, { Schema } from 'mongoose';

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    status: {
        type: Boolean,
        default: true,
    },

    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

export const Role = mongoose.model('Role', RoleSchema);