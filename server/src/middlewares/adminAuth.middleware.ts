import type { Elysia } from "elysia";
import { jwtAdminAccess } from "./jwt.middleware";
import Admin from "../models/admin.model";
import { UnauthorizedError, NotFoundError, JWTError } from "./error.middleware";

export const isAdmin_Authenticated = (app: Elysia) =>
	app
		.use(jwtAdminAccess)
		.derive(async function handler({
			adminAccessJwt,
			cookie: { adminAccess, adminRefresh },
		}) {
			const accessToken = adminAccess.value;
			const refreshToken = adminRefresh.value;

			if (!accessToken && !refreshToken) {
				// No tokens at all - clear everything and force login
				adminAccess.remove();
				adminRefresh.remove();
				throw new UnauthorizedError('Authentication required');
			}

			try {
				// Try to verify access token first
				if (accessToken) {
					const payload = await adminAccessJwt.verify(accessToken);

					if (payload && payload.adminId) {
						const admin = await Admin.findById(payload.adminId).select('-pin');

						if (admin) {
							return { admin };
						}
					}
				}

				// If we have a refresh token but access token failed,
				// suggest client should try refresh
				if (refreshToken) {
					throw new UnauthorizedError('Access token expired, refresh required');
				}

				// No valid tokens
				adminAccess.remove();
				adminRefresh.remove();
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
				adminAccess.remove();
				adminRefresh.remove();
				throw new UnauthorizedError('Authentication failed');
			}
		});
