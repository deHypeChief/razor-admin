import mongoose from 'mongoose';

interface IUser {
    sessionClientId: mongoose.Types.ObjectId;
    fullName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    username: string;
}

const userSchema = new mongoose.Schema<IUser>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SessionClient',
    },
    username: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
