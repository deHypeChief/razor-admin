import { jwt } from '@elysiajs/jwt';
import Elysia from 'elysia'
import { ADMIN_AUTH_CONFIG, USER_AUTH_CONFIG } from '../configs/auth.config';


export const jwtAdminAccess = new Elysia({
    name: "adminAccessJwt",
}).use(
    jwt({
        name: "adminAccessJwt",
        secret: Bun.env.ADMIN_JWT as string,
        exp: ADMIN_AUTH_CONFIG.accessToken.jwtExp,
    })
);

export const jwtAdminRefresh = new Elysia({
    name: "adminRefreshJwt",
}).use(
    jwt({
        name: "adminRefreshJwt",
        secret: Bun.env.ADMIN_JWT as string,
        exp: ADMIN_AUTH_CONFIG.refreshToken.jwtExp,
    })
);


export const jwtUserAccess = new Elysia({
    name: "userAccessJwt",
}).use(
    jwt({
        name: "userAccessJwt",
        secret: Bun.env.USER_JWT as string,
        exp: USER_AUTH_CONFIG.accessToken.jwtExp,
    })
);

export const jwtUserRefresh = new Elysia({
    name: "userRefreshJwt",
}).use(
    jwt({
        name: "userRefreshJwt",
        secret: Bun.env.USER_JWT as string,
        exp: USER_AUTH_CONFIG.refreshToken.jwtExp,
    })
);


export interface UserPayload {
    userId: string;
    email: string;
}

export interface AdminPayload {
    adminId: string;
    adminEmail: string;
}