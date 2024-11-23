import mongoose, { ObjectId, Schema } from "mongoose";


interface IAdminRefreshToken extends Document {
    adminId: ObjectId;
    token: string;
    issuedAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
    ipAddress: string;
    userAgent: string;
}

const adminRefreshTokenSchema = new Schema<IAdminRefreshToken>(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        ipAddress: {
            type: String,
            required: true
            // validate: {
            //     validator: function (v: string) {
            //         // Basic IP address validation (IPv4 or IPv6)
            //         const ipRegex =
            //             /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.([0-9]{1,3}\.){2}[0-9]{1,3}$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;
            //         return ipRegex.test(v);
            //     },
            //     message: (props: { value: any; }) => `${props.value} is not a valid IP address!`,
            // },
        },
        // Information about the browser or user agent
        userAgent: {
            type: String,
            required: true,
            maxlength: 500, // Restrict the length to prevent overly large user-agent strings
        },
    },
    {
        timestamps: true,  // Automatically add createdAt and updatedAt fields
    }
);


// Pre-save hook for additional security and sanitization
adminRefreshTokenSchema.pre('save', async function (next) {
    try {
        // Validate the IP address and sanitize it (if necessary)
        if (!this.ipAddress || !this.userAgent) {
            throw new Error('IP Address or Browser Info is missing.');
        }

        // Sanitize browser info by removing potentially harmful characters
        this.userAgent = this.userAgent.replace(/[^a-zA-Z0-9 .:;/()\-]+/g, '');

        next(); // Continue with the save operation
    } catch (error) {
        next(error as undefined); // Pass the error to Mongoose
    }
});


// Method to check if the refresh token has expired
adminRefreshTokenSchema.methods.isExpired = function () {
    return this.expiresAt < Date.now();
};

// Method to revoke the token (e.g., logout)
adminRefreshTokenSchema.methods.revoke = function () {
    this.isRevoked = true;
    return this.save();
};

adminRefreshTokenSchema.statics.deleteExpiredTokens = async function () {
    // Find tokens that are expired and delete them
    const result = await this.deleteMany({ expiresAt: { $lt: Date.now() } });
    return result;
};

// Create a model from the schema
export const AdminRefreshToken = mongoose.model('Admin_Refresh_Token', adminRefreshTokenSchema);





interface IUserRefreshToken extends Document {
    userId: ObjectId;
    token: string;
    issuedAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
    ipAddress: string;
    userAgent: string;
}

const userRefreshTokenSchema = new Schema<IUserRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        ipAddress: {
            type: String,
            required: true
            // validate: {
            //     validator: function (v: string) {
            //         // Basic IP address validation (IPv4 or IPv6)
            //         const ipRegex =
            //             /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.([0-9]{1,3}\.){2}[0-9]{1,3}$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;
            //         return ipRegex.test(v);
            //     },
            //     message: (props: { value: any; }) => `${props.value} is not a valid IP address!`,
            // },
        },
        // Information about the browser or user agent
        userAgent: {
            type: String,
            required: true,
            maxlength: 500, // Restrict the length to prevent overly large user-agent strings
        },
    },
    {
        timestamps: true,  // Automatically add createdAt and updatedAt fields
    }
);


// Pre-save hook for additional security and sanitization
userRefreshTokenSchema.pre('save', async function (next) {
    try {
        // Validate the IP address and sanitize it (if necessary)
        if (!this.ipAddress || !this.userAgent) {
            throw new Error('IP Address or Browser Info is missing.');
        }

        // Sanitize browser info by removing potentially harmful characters
        this.userAgent = this.userAgent.replace(/[^a-zA-Z0-9 .:;/()\-]+/g, '');

        next(); // Continue with the save operation
    } catch (error) {
        next(error as undefined); // Pass the error to Mongoose
    }
});


// Method to check if the refresh token has expired
userRefreshTokenSchema.methods.isExpired = function () {
    return this.expiresAt < Date.now();
};

// Method to revoke the token (e.g., logout)
userRefreshTokenSchema.methods.revoke = function () {
    this.isRevoked = true;
    return this.save();
};

userRefreshTokenSchema.statics.deleteExpiredTokens = async function () {
    // Find tokens that are expired and delete them
    const result = await this.deleteMany({ expiresAt: { $lt: Date.now() } });
    return result;
};

// Create a model from the schema
export const UserRefreshToken = mongoose.model('User_Refresh_Token', userRefreshTokenSchema);