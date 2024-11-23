import { NotifyAdmin, NotifyUser } from '../models/notification.model';

export async function sendAdminNotification(adminId: string, title: string, message: string, type: "info" | "alert" | "success") {
    await NotifyAdmin.create({
        adminID: adminId,
        title,
        message,
        type
    });
}

export async function sendUserNotification(userId: string, title: string, message: string, type: "info" | "alert" | "success") {
    await NotifyUser.create({
        userId: userId,
        title,
        message,
        type
    });
}