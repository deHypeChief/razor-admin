import Elysia from "elysia";
import { createUserSchema, loginUserSchema } from "./_setup";
import {
    UnauthorizedError,
    ValidationError,
    NotFoundError,
    TokenRefreshError,
    TokenExpiredError
} from "../../middlewares/error.middleware";
import { jwtUserAccess, jwtUserRefresh, UserPayload } from "../../middlewares/jwt.middleware";
import { setUserCookies, signUserCookie } from "../../services/authCookie";
import { UserRefreshToken } from '../../models/refreshToken.model';
import User from "../../models/user.model";
import { sendUserNotification } from "../../services/sendNotification";
import { sendMail } from "../../services/sendEmail";

const userAuthRoute = new Elysia({
    prefix: "/user/auth"
})
    .use(sendMail)
    .post("/createUser", async ({ body, mailConfig, generateEmail }) => {
        const {
            username,
            password,
            email,
            fullName,
            dob,
            phoneNumber,
        } = body;

        const checkExistingMail = await User.findOne({ email });
        if (checkExistingMail) {
            throw new ValidationError("Email address is already registered");
        }

        try {
            const newUser = new User({
                username,
                password,
                email,
                fullName,
                dob,
                phoneNumber,
            });
            await newUser.save();

            await sendUserNotification(
                newUser._id.toString(),
                "Welcome Header",
                "Welcome Message",
                "info",
            )

            mailConfig(
                newUser.email,
                "Account Created",
                generateEmail()
            )

            const { password: _, ...user } = newUser.toObject();
            return {
                success: true,
                message: "User account created successfully",
                data: { user }
            };
        } catch (error) {
            console.log(error)
            throw new ValidationError("Failed to create user account");
        }
    }, createUserSchema)
    .use(jwtUserAccess)
    .use(jwtUserRefresh)
    .post("/loginUser", async ({
        cookie: { userAccess, userRefresh },
        request,
        userAccessJwt,
        userRefreshJwt,
        body,
        headers,
        mailConfig,
        generateEmail
    }) => {
        const { email, password } = body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new ValidationError("Invalid credentials");
        }
        if (user.socialAuth) {
            throw new ValidationError("Sign with your social account");
        }

        const isPasswordValid = await user.comparePin(password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid credentials");
        }

        try {
            await signUserCookie(
                user,
                request,
                headers,
                userAccess,
                userRefresh,
                userAccessJwt,
                userRefreshJwt
            )

            mailConfig(
                user.email,
                "Account Logged-In",
                generateEmail()
            )

            const { password: _, ...userData } = user.toObject();
            return {
                success: true,
                message: "Login successful",
                data: { user: userData }
            };
        } catch (error) {
            throw new UnauthorizedError("Authentication failed");
        }
    }, loginUserSchema)
    .get("/logout", async ({ cookie: { userAccess, userRefresh } }) => {
        try {
            if (userRefresh.value) {
                await UserRefreshToken.findOneAndDelete({ token: userRefresh.value });
            }

            userAccess.remove();
            userRefresh.remove();

            return {
                success: true,
                message: "Logged out successfully"
            };
        } catch (error) {
            throw new UnauthorizedError("Logout failed");
        }
    })
    .get("/refresh", async ({
        cookie: { userAccess, userRefresh },
        userRefreshJwt,
        userAccessJwt,
        request,
        headers
    }) => {
        const refreshToken = userRefresh.value;

        if (!refreshToken) {
            throw new TokenRefreshError("No refresh token provided");
        }

        try {
            const payload = await userRefreshJwt.verify(refreshToken) as unknown as UserPayload;

            if (!payload?.userId) {
                throw new TokenRefreshError("Invalid refresh token"); l
            }

            const storedRefreshToken = await UserRefreshToken.findOne({
                userId: payload.userId,
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

            const user = await User.findById(payload.userId);
            if (!user) {
                throw new NotFoundError("User account not found");
            }

            const tokenPayload = {
                user: user._id.toString(),
                email: user.email
            };

            const [newAccessToken, newRefreshToken] = await Promise.all([
                userAccessJwt.sign(tokenPayload),
                userRefreshJwt.sign(tokenPayload),
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

            await UserRefreshToken.create({
                userId: user._id,
                token: newRefreshToken,
                issuedAt: new Date(),
                expiresAt: storedRefreshToken.expiresAt,
                isRevoked: false,
                ...refreshMetadata
            });

            setUserCookies(
                userAccess,
                newAccessToken,
                userRefresh,
                newRefreshToken
            );

            const { password: _, ...userData } = user.toObject();

            return {
                success: true,
                message: "Tokens refreshed successfully",
                data: { user: userData }
            };
        } catch (error) {
            userAccess.remove();
            userRefresh.remove();

            if (error instanceof TokenExpiredError ||
                error instanceof TokenRefreshError ||
                error instanceof NotFoundError) {
                throw error;
            }

            throw new TokenRefreshError("Token refresh failed", error as Error);
        }
    });

export default userAuthRoute;