import mongoose from "mongoose";

interface IUserFA extends Document{
    userID: ObjectId;
    twoFactorSecret ?: string;
    twoFactorEnabled: boolean;
    twoFactorMethod ?: '2fa-totp' | '2fa-sms' | '2fa-email';
    tempSecret ?: string;
    tempSecretExpiry ?: Date;
    backupCodes: Array<{ code: string; used: boolean }>;
    failedAttempts: number;
    lastFailedAttempt ?: Date;
}

const factorUserAuthScheam = new mongoose.Schema<IUserFA>({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    twoFactorSecret: String,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: {
        type: String,
        enum: ['2fa-totp', '2fa-sms', '2fa-email']
    },
    tempSecret: String,
    tempSecretExpiry: Date,
    backupCodes: [{
        code: String,
        used: { type: Boolean, default: false }
    }],
    failedAttempts: { type: Number, default: 0 },
    lastFailedAttempt: Date
});

export const UserFactorAuth = mongoose.model<IUserFA>('Factor_User_Auth', factorUserAuthScheam);