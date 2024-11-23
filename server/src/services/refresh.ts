import { ADMIN_AUTH_CONFIG } from "../configs/auth.config";
import {AdminRefreshToken} from "../models/refreshToken.model";

export async function handleAdminRefreshTokens(
    adminId: string,
    token: string,
    refreshMetadata: {
        ipAddress: string;
        userAgent: string;
    }
) {
    const { ipAddress, userAgent } = refreshMetadata;

    // Check if a refresh token with the same userAgent exists
    const existingRefreshToken = await AdminRefreshToken.findOne({ userAgent });

    if (existingRefreshToken) {
        // Update the existing refresh token
        const updatedToken = await AdminRefreshToken.findOneAndUpdate(
            { userAgent },
            {
                adminId,
                token,
                issuedAt: new Date(),
                expiresAt: ADMIN_AUTH_CONFIG.refreshToken.expiresAt,
                isRevoked: false,
                ipAddress,
            },
            { new: true }
        ).select("-token"); // Exclude the token field from the result

        return {
            tokenData: updatedToken,
        };
    }

    // Create a new refresh token if none exists
    const newRefreshToken = new AdminRefreshToken({
        adminId,
        token,
        issuedAt: new Date(),
        expiresAt: ADMIN_AUTH_CONFIG.refreshToken.expiresAt,
        isRevoked: false,
        ipAddress,
        userAgent,
    });

    await newRefreshToken.save();

    // Convert the Mongoose document to a plain object and exclude the token field
    const {token: _, ...tokenData} = newRefreshToken.toObject();

    return {
        tokenData,
    };
}



import { USER_AUTH_CONFIG } from "../configs/auth.config";
import {UserRefreshToken} from "../models/refreshToken.model";

export async function handleUserRefreshTokens(
    userId: string,
    token: string,
    refreshMetadata: {
        ipAddress: string;
        userAgent: string;
    }
) {
    const { ipAddress, userAgent } = refreshMetadata;

    // Check if a refresh token with the same userAgent exists
    const existingRefreshToken = await UserRefreshToken.findOne({ userAgent });

    if (existingRefreshToken) {
        // Update the existing refresh token
        const updatedToken = await UserRefreshToken.findOneAndUpdate(
            { userAgent },
            {
                userId,
                token,
                issuedAt: new Date(),
                expiresAt: USER_AUTH_CONFIG.refreshToken.expiresAt,
                isRevoked: false,
                ipAddress,
            },
            { new: true }
        ).select("-token"); // Exclude the token field from the result

        return {
            tokenData: updatedToken,
        };
    }

    // Create a new refresh token if none exists
    const newRefreshToken = new UserRefreshToken({
        userId,
        token,
        issuedAt: new Date(),
        expiresAt: USER_AUTH_CONFIG.refreshToken.expiresAt,
        isRevoked: false,
        ipAddress,
        userAgent,
    });

    await newRefreshToken.save();

    // Convert the Mongoose document to a plain object and exclude the token field
    const {token: _, ...tokenData} = newRefreshToken.toObject();

    return {
        tokenData,
    };
}
