import Elysia from "elysia";
import { jwtSessionAccess, jwtSessionRefresh } from "./jwt.middleware";
import ErrorHandler from "../services/errorHandler.service";
import { SessionClient } from "../components/auth/_model";
import { User } from "../components/users/_model";
import AuthHandler from "../services/authHandler.service";

export const isSessionAuth = (app: Elysia) =>
    app
        .use(jwtSessionAccess)
        .use(jwtSessionRefresh)
        .derive(async function handler({
            request,
            headers,
            sessionAccessJwt,
            sessionRefreshJwt,
            cookie: { sessionAccess, sessionRefresh },
            set
        }) {
            try {
                const a_t = sessionAccess.value;
                const r_t = sessionRefresh.value;

                if (!a_t && !r_t) {
                    sessionAccess.remove();
                    sessionRefresh.remove();

                    throw ErrorHandler.UnauthorizedError(
                        set,
                        "Authentication tokens required",
                    );
                }

                // Try to verify access token first
                if (a_t) {
                    try {
                        const payload = await sessionAccessJwt.verify(a_t);
                        if (payload && payload.sessionClientId) {
                            return await validateSession(payload, set);
                        }
                    } catch (error) {
                        // Access token is invalid, try refresh token
                        if (!r_t) {
                            throw ErrorHandler.UnauthorizedError(
                                set,
                                "Access token expired and no refresh token present"
                            );
                        }
                    }
                }

                // Try to refresh the token
                if (r_t) {
                    try {
                        const refreshPayload = await sessionRefreshJwt.verify(r_t);
                        if (refreshPayload && refreshPayload.sessionClientId) {

                            const sessionClient = await SessionClient.findById(refreshPayload.sessionClientId);

                            if (!sessionClient) {
                                throw ErrorHandler.UnauthorizedError(
                                    set,
                                    "Invalid session client"
                                );
                            }

                            // Generate new access token
                            await AuthHandler.signSession(
                                set,
                                sessionClient,
                                request,
                                headers,
                                sessionAccess,
                                sessionRefresh,
                                sessionAccessJwt,
                                sessionRefreshJwt,
                            )

                            return await validateSession(refreshPayload, set);
                        }
                    } catch (error) {
                        sessionAccess.remove();
                        sessionRefresh.remove();
                        throw ErrorHandler.UnauthorizedError(
                            set,
                            "Refresh token expired",
                            error
                        );
                    }
                }

                sessionAccess.remove();
                sessionRefresh.remove();
                throw ErrorHandler.UnauthorizedError(
                    set,
                    "Invalid authentication tokens"
                );
            } catch (error) {
                sessionAccess.remove();
                sessionRefresh.remove();
                throw error
            }
        });

async function validateSession(payload: any, set: any) {
    const { role } = payload;

    // validate session existence
    const isSession = await SessionClient.findById(payload.sessionClientId);
    if (!isSession) {
        throw ErrorHandler.UnauthorizedError(
            set,
            "Invalid session client"
        );
    }


    // user info
    if (role === "user") {
        const sessionClient = await User.findOne({ sessionClientId: payload.sessionClientId });
        if (sessionClient) {
            return { sessionClient };
        } else {
            throw ErrorHandler.UnauthorizedError(
                set,
                "User not found"
            );
        }
    }
}