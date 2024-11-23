import type { Elysia } from "elysia";
import Admin from "../models/admin.model";
import { UnauthorizedError, JWTError } from "./error.middleware";
import { jwtUserAccess } from "./jwt.middleware";
import User from "../models/user.model";

export const isUser_Authenticated = (app: Elysia) =>
    app
        .use(jwtUserAccess)
        .derive(async function handler({
            userAccessJwt,
            cookie: { userAccess, userRefresh },
        }) {
            const accessToken = userAccess.value;
            const refreshToken = userRefresh.value;

            if (!accessToken && !refreshToken) {
                // No tokens at all - clear everything and force login
                userAccess.remove();
                userRefresh.remove();
                throw new UnauthorizedError('Authentication required');
            }

            try {
                // Try to verify access token first
                if (accessToken) {
                    const payload = await userAccessJwt.verify(accessToken);

                    if (payload && payload.userId) {
                        const user = await User.findById(payload.userId).select('-password');

                        if (user) {
                            return { user };
                        }
                    }
                }

                // If we have a refresh token but access token failed,
                // suggest client should try refresh
                if (refreshToken) {
                    throw new UnauthorizedError('Access token expired, refresh required');
                }

                // No valid tokens
                userAccess.remove();
                userRefresh.remove();
                throw new UnauthorizedError('Authentication required');

            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    throw err;
                }

                // For JWT verification errors
                if (err instanceof Error) {
                    if (refreshToken) {
                        throw new JWTError('Access token invalid, refresh required', err);
                    }
                    throw new JWTError('Authentication verification failed', err);
                }

                // Clear cookies and force reauth for unexpected errors
                userAccess.remove();
                userRefresh.remove();
                throw new UnauthorizedError('Authentication failed');
            }
        });
