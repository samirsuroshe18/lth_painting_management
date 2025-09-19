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
    
    // ADD THESE NEW FIELDS:
    departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',  // Changed from 'Department' to 'departments'
    required: false
    },

    buildingId: {
    type: Schema.Types.ObjectId,
    ref: 'Building',    // Changed from 'Building' to 'buildings'  
    required: false
    },

    floorId: {
    type: Schema.Types.ObjectId,
    ref: 'Floor',       // Changed from 'Floor' to 'floors'
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
        maxlength: 100,
        default: 'N/A'
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