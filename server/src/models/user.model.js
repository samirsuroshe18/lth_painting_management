import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { config } from "../config/env.js";

const permissionSchema = new Schema({
  action: { type: String, required: true },
  effect: { type: String, enum: ['Allow', 'Deny'], required: true }
});

const userSchema = new Schema({
    profilePic: {
        type: String
    },

    userName: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    mobileNo: {
        type: String,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['superadmin', 'admin', 'auditor', 'supervisor','user '],
        default: 'supervisor',
    },

    permissions: [permissionSchema],

    location: [{
        type: Schema.Types.ObjectId,
        ref: "Location"
    }],

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    lastLogin: {
        type: Date,
    },

    isRemember: {
        type: Boolean,
        default: false
    },

    lastLogout: {
        type: Date,
    },

    isLoggedIn: {
        type: Boolean,
        default: false,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    refreshToken: {
        type: String
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    forgotPasswordToken: String,

    forgotPasswordTokenExpiry: Date,

}, { timestamps: true });

//pre hooks allow us to do any operation before saving the data in database
//in pre hook the first parameter on which event you have to do the operation like save, validation, etc
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//you can create your custom methods as well by using methods object
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

//jwt is a bearer token it means the person bear this token we give the access to that person its kind of chavi
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
        }, config.jwt.accessSecret,
        {
            expiresIn: config.jwt.accessExpiry
        }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        config.jwt.refreshSecret,
        {
            expiresIn: config.jwt.refreshExpiry
        }
    );
}

export const User = mongoose.model("User", userSchema);