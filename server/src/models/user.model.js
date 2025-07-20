import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const permissionSchema = new Schema({
  action: { type: String, required: true },
  effect: { type: String, enum: ['Allow', 'Deny'], required: true }
});

const userSchema = new Schema({
    profileProfile: {
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
        required: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['superadmin', 'admin', 'auditor', 'user'],
        default: 'user',
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
        }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const User = mongoose.model("User", userSchema);



// const assets = await Asset.find()
//     .populate({
//         path: 'locationId',
//         model: 'Location', // specify the model
//         populate: {
//             path: 'stateId',
//             model: 'State',
//             populate: {
//                 path: 'countryId',
//                 model: 'Country'
//             }
//         }
//     });



//###### That's how you can check which permission this user has #######


// const userPermissions = [
//   { action: "read_reports", effect: "Allow" },
//   { action: "delete_user", effect: "Deny" }
// ];

// const canAccess = (action) => {
//   const permission = userPermissions.find((p) => p.action === action);
//   return permission && permission.effect === "Allow";
// };
// Usage in JSX:

// jsx
// Copy
// Edit
// {canAccess("read_reports") && (
//   <button onClick={downloadReport}>Download Report</button>
// )}