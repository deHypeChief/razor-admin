import crypto from 'crypto';
import { UserFactorAuth } from '../models/2fa.model';

export const createRateLimiter = (windowMs: number, max: number) => {
    const attempts = new Map<string, { count: number; resetTime: number }>();

    return async (key: string): Promise<boolean> => {
        const now = Date.now();
        const record = attempts.get(key);

        if (!record) {
            attempts.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (now > record.resetTime) {
            attempts.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (record.count >= max) {
            return false;
        }

        record.count++;
        return true;
    };
};

export const userLoginLimiter = createRateLimiter(15 * 60 * 1000, 5);
export const userVerificationLimiter = createRateLimiter(5 * 60 * 1000, 3);

export const generateBackupCodes = (count: number = 10): string[] => {
    return Array.from({ length: count }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    );
};

export const verifyUserTempSecret = async (userID: string, code: string): Promise<boolean> => {
    const userfa = await UserFactorAuth.findOne(userID);
    if (!userfa) return false;

    const now = new Date();
    return !!(
        userfa.tempSecret === code &&
        userfa.tempSecretExpiry &&
        userfa.tempSecretExpiry > now
    );
};