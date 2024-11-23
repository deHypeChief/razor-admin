import { Cookie } from "elysia";
import { ADMIN_AUTH_CONFIG, USER_AUTH_CONFIG } from "../configs/auth.config";
import { handleUserRefreshTokens } from "./refresh";
import { JWTPayloadSpec } from "@elysiajs/jwt";

export function setAdminCookies(
    cookieAccess: Cookie<string | undefined>,
    accessToken: string,
    cookieRefresh: Cookie<string | undefined>,
    refreshToken: string
) {
    cookieAccess.set({
        value: accessToken,
        ...ADMIN_AUTH_CONFIG.accessToken.cookie
    })
    cookieRefresh.set({
        value: refreshToken,
        ...ADMIN_AUTH_CONFIG.refreshToken.cookie
    })
}


export function setUserCookies(
    cookieAccess: Cookie<string | undefined>,
    accessToken: string,
    cookieRefresh: Cookie<string | undefined>,
    refreshToken: string
) {
    cookieAccess.set({
        value: accessToken,
        ...USER_AUTH_CONFIG.accessToken.cookie
    })
    cookieRefresh.set({
        value: refreshToken,
        ...USER_AUTH_CONFIG.refreshToken.cookie
    })
}

export async function signUserCookie(
    user: any,
    request: Request,
    headers: Record<string, string | undefined>,
    userAccess: Cookie<string | undefined>,
    userRefresh: Cookie<string | undefined>,
    userAccessJwt: { sign: any; verify?: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>; },
    userRefreshJwt: { sign: any; verify?: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>; }
) {
    const tokenPayload = {
        userId: user._id.toString(),
        email: user.email
    };

    const [accessToken, refreshToken] = await Promise.all([
        userAccessJwt.sign(tokenPayload),
        userRefreshJwt.sign(tokenPayload),
    ]);

    const directIp = request.headers.get('x-forwarded-for')?.split(',')[0]
        || request.headers.get('cf-connecting-ip')
        || request.headers.get('x-real-ip')
        || 'Unknown';

    const refreshMetadata = {
        ipAddress: directIp,
        userAgent: headers["user-agent"] as string
    };

    await handleUserRefreshTokens(
        user._id.toString(),
        refreshToken,
        refreshMetadata
    );

    setUserCookies(
        userAccess,
        accessToken,
        userRefresh,
        refreshToken
    );
}