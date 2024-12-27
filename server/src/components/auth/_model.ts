import mongoose, { ObjectId } from 'mongoose';

export interface ISessionClient extends Document {
    email: string;
    password: string;
    role: "user" | "admin";
    sessions: mongoose.Types.ObjectId[];
    isSocialAuth: boolean;
    isEmailVerified: boolean;
    comparePassword(inputPassword: string): Promise<boolean>;
}

export interface ISession extends Document {
    sessionClientId: mongoose.Types.ObjectId;
    refreshToken: string;
    accessToken: string;
    ip?: string;
    userAgent?: string;
    lastAccessed: Date;
}

const sessionClientSchema = new mongoose.Schema<ISessionClient>({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session', 
    }],
    isSocialAuth:{
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

sessionClientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await Bun.password.hash(this.password, "bcrypt");
    next();
});

sessionClientSchema.methods.comparePassword = async function (inputPassword: string): Promise<boolean> {
    return await Bun.password.verify(inputPassword, this.password);
};



const sessionSchema = new mongoose.Schema<ISession>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SessionClient',
    },
    refreshToken: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    ip: {
        type: String, // Optionally track the IP address
    },
    userAgent: {
        type: String, // Track the device/browser the session is coming from
    },
    lastAccessed: {
        type: Date,
        default: Date.now,
    }
});


export const Session = mongoose.model<ISession>('Session', sessionSchema);
export const SessionClient = mongoose.model<ISessionClient>('SessionClient', sessionClientSchema);

