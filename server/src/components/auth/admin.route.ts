import Elysia from "elysia";
import { createAdminSchema, loginAdminSchema } from "./_setup";
import Admin from "../../models/admin.model";
import {
    UnauthorizedError,
    ValidationError,
    NotFoundError,
    TokenRefreshError,
    TokenExpiredError
} from "../../middlewares/error.middleware";
import { jwtAdminAccess, jwtAdminRefresh, AdminPayload } from '../../middlewares/jwt.middleware';
import { handleAdminRefreshTokens } from "../../services/refresh";
import { setAdminCookies } from "../../services/authCookie";
import { AdminRefreshToken } from '../../models/refreshToken.model';

const adminAuthRoute = new Elysia({
    prefix: "/admin/auth"
})
    .post("/createAdmin", async ({ body }) => {
        const { adminEmail, pin, adminRole, adminName } = body;

        const checkExistingMail = await Admin.findOne({ adminEmail });
        if (checkExistingMail) {
            throw new ValidationError("Email address is already registered");
        }

        try {
            const newAdmin = new Admin({
                adminEmail,
                pin,
                adminRole,
                adminName
            });
            await newAdmin.save();

            const { pin: _, ...admin } = newAdmin.toObject();
            return {
                success: true,
                message: "Admin account created successfully",
                data: { admin }
            };
        } catch (error) {
            throw new ValidationError("Failed to create admin account");
        }
    }, createAdminSchema)
    .use(jwtAdminAccess)
    .use(jwtAdminRefresh)
    .post("/loginAdmin", async ({
        cookie: { adminAccess, adminRefresh },
        request,
        adminAccessJwt,
        adminRefreshJwt,
        body,
        headers
    }) => {
        const { adminEmail, pin } = body;

        const admin = await Admin.findOne({ adminEmail });
        if (!admin) {
            throw new ValidationError("Invalid credentials");
        }

        const isPinValid = await admin.comparePin(pin);
        if (!isPinValid) {
            throw new ValidationError("Invalid credentials");
        }

        try {
            const tokenPayload = {
                adminId: admin._id.toString(),
                adminEmail: admin.adminEmail
            };

            const [accessToken, refreshToken] = await Promise.all([
                adminAccessJwt.sign(tokenPayload),
                adminRefreshJwt.sign(tokenPayload),
            ]);

            const directIp = request.headers.get('x-forwarded-for')?.split(',')[0]
                || request.headers.get('cf-connecting-ip')
                || request.headers.get('x-real-ip')
                || 'Unknown';

            const refreshMetadata = {
                ipAddress: directIp,
                userAgent: headers["user-agent"] as string
            };

            await handleAdminRefreshTokens(
                admin._id.toString(),
                refreshToken,
                refreshMetadata
            );

            setAdminCookies(
                adminAccess,
                accessToken,
                adminRefresh,
                refreshToken
            );

            const { pin: _, ...adminData } = admin.toObject();
            return {
                success: true,
                message: "Login successful",
                data: { admin: adminData }
            };
        } catch (error) {
            throw new UnauthorizedError("Authentication failed");
        }
    }, loginAdminSchema)
    .get("/logout", async ({ cookie: { adminAccess, adminRefresh } }) => {
        try {
            if (adminRefresh.value) {
                await AdminRefreshToken.findOneAndDelete({ token: adminRefresh.value });
            }

            adminAccess.remove();
            adminRefresh.remove();

            return {
                success: true,
                message: "Logged out successfully"
            };
        } catch (error) {
            throw new UnauthorizedError("Logout failed");
        }
    })
    .get("/refresh", async ({
        cookie: { adminAccess, adminRefresh },
        adminRefreshJwt,
        adminAccessJwt,
        request,
        headers
    }) => {
        const refreshToken = adminRefresh.value;

        if (!refreshToken) {
            throw new TokenRefreshError("No refresh token provided");
        }

        try {
            const payload = await adminRefreshJwt.verify(refreshToken) as unknown as AdminPayload;

            if (!payload?.adminId) {
                throw new TokenRefreshError("Invalid refresh token");
            }

            const storedRefreshToken = await AdminRefreshToken.findOne({
                adminId: payload.adminId,
                token: refreshToken,
                isRevoked: false
            });

            if (!storedRefreshToken) {
                throw new TokenRefreshError("Refresh token not found or revoked");
            }

            if (storedRefreshToken.expiresAt < new Date()) {
                await storedRefreshToken.updateOne({ isRevoked: true });
                throw new TokenExpiredError("Refresh token has expired");
            }

            const admin = await Admin.findById(payload.adminId);
            if (!admin) {
                throw new NotFoundError("Admin account not found");
            }

            const tokenPayload = {
                adminId: admin._id.toString(),
                adminEmail: admin.adminEmail
            };

            const [newAccessToken, newRefreshToken] = await Promise.all([
                adminAccessJwt.sign(tokenPayload),
                adminRefreshJwt.sign(tokenPayload),
            ]);

            const directIp = request.headers.get('x-forwarded-for')?.split(',')[0]
                || request.headers.get('cf-connecting-ip')
                || request.headers.get('x-real-ip')
                || 'Unknown';

            await storedRefreshToken.updateOne({ isRevoked: true });

            const refreshMetadata = {
                ipAddress: directIp,
                userAgent: headers["user-agent"] as string
            };

            await AdminRefreshToken.create({
                adminId: admin._id,
                token: newRefreshToken,
                issuedAt: new Date(),
                expiresAt: storedRefreshToken.expiresAt,
                isRevoked: false,
                ...refreshMetadata
            });

            setAdminCookies(
                adminAccess,
                newAccessToken,
                adminRefresh,
                newRefreshToken
            );

            const { pin: _, ...adminData } = admin.toObject();

            return {
                success: true,
                message: "Tokens refreshed successfully",
                data: { admin: adminData }
            };
        } catch (error) {
            adminAccess.remove();
            adminRefresh.remove();

            if (error instanceof TokenExpiredError ||
                error instanceof TokenRefreshError ||
                error instanceof NotFoundError) {
                throw error;
            }

            throw new TokenRefreshError("Token refresh failed", error as Error);
        }
    });

export default adminAuthRoute;