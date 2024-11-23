import mongoose, { ObjectId } from "mongoose";


interface INotifyUser extends Document {
    userID: ObjectId;
    title: string;
    message: string;
    status: 'unread' | 'read';
    type: 'info' | 'alert' | 'success';
    createdAt: Date
}

const notificationUserSchema = new mongoose.Schema<INotifyUser>({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {type: String, required: true},
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    type: { type: String, enum: ['info', 'alert', 'success'], default: 'info' },
    createdAt: { type: Date, default: Date.now }
});

export const NotifyUser = mongoose.model<INotifyUser>('User_Notification', notificationUserSchema);




interface INotifyAdmin extends Document {
    adminID: ObjectId;
    title: string;
    message: string;
    status: 'unread' | 'read';
    type: 'info' | 'alert' | 'success';
    createdAt: Date
}

const notificationAdminSchema = new mongoose.Schema<INotifyAdmin>({
    adminID: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    title: {type: String, required: true},
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    type: { type: String, enum: ['info', 'alert', 'success'], default: 'info' },
    createdAt: { type: Date, default: Date.now }
});

export const NotifyAdmin = mongoose.model<INotifyAdmin>('Admin_Notification', notificationAdminSchema);