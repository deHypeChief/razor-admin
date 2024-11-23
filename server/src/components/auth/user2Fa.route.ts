// pending Update

import { UserFactorAuth } from "../../models/2fa.model";
import bcrypt from 'bcryptjs';
import { generateBackupCodes, userVerificationLimiter } from "../../services/2Fa";
import speakeasy from 'speakeasy'
import Elysia, { t } from "elysia";

const user2Fa = new Elysia()
    .post(
        '/generate-backup-codes/:userID',
        async ({ params: { userID } }) => {
            const user = await UserFactorAuth.findOne({ userID });
            if (!user) throw new Error('User not found');

            const backupCodes = generateBackupCodes();
            const hashedBackupCodes = await Promise.all(
                backupCodes.map(async (code) => ({
                    code: await bcrypt.hash(code, 10),
                    used: false
                }))
            );

            await UserFactorAuth.findOneAndUpdate({ userID }, { backupCodes: hashedBackupCodes });
            return { backupCodes };
        },
        {
            params: t.Object({
                userID: t.String()
            }),
            response: t.Object({
                backupCodes: t.Array(t.String())
            })
        }
    )
    .post(
        '/verify-backup-code',
        async ({ body }) => {
            const { userID, code } = body;

            const user = await UserFactorAuth.findOne({ userID });
            if (!user) throw new Error('User not found');

            const backupCode = user.backupCodes.find(async (bc) => {
                if (bc.used) return false;
                return await bcrypt.compare(code, bc.code);
            });

            if (backupCode) {
                backupCode.used = true;
                await user.save();
                return { success: true };
            }

            throw new Error('Invalid backup code');
        },
        {
            body: t.Object({
                userID: t.String(),
                code: t.String({ minLength: 8, maxLength: 8 })
            }),
            response: t.Object({
                success: t.Boolean()
            })
        }
    )
    .post(
        '/setup-totp',
        async ({ body }) => {
            const { userId } = body;

            if (!await userVerificationLimiter(`setup-totp:${userId}`)) {
                throw new Error('Too many attempts. Please try again later.');
            }

            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const secret = speakeasy.generateSecret({
                name: `YourApp:${user.email}`,
            });

            await User.findByIdAndUpdate(userId, {
                twoFactorSecret: secret.base32,
                twoFactorEnabled: false,
            });

            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
            return { secret: secret.base32, qrCode: qrCodeUrl };
        },
        {
            body: t.Object({
                userId: t.String()
            }),
            response: t.Object({
                secret: t.String(),
                qrCode: t.String()
            })
        }
    )
    .post(
        '/verify-totp',
        async ({ body }) => {
            const { userID, token } = body;

            if (!await userVerificationLimiter(`verify-totp:${userID}`)) {
                throw new Error('Too many verification attempts');
            }

            const user = await UserFactorAuth.findOne({ userID });
            if (!user) throw new Error('User not found');

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret!,
                encoding: 'base32',
                token,
            });

            if (verified) {
                await UserFactorAuth.findOneAndUpdate({ userID }, {
                    twoFactorEnabled: true,
                    twoFactorMethod: '2fa-totp',
                });
                return { success: true };
            }

            throw new Error('Invalid TOTP token');
        },
        {
            body: t.Object({
                userID: t.String(),
                token: t.String({ length: 6 })
            }),
            response: t.Object({
                success: t.Boolean()
            })
        }
    )
    .post(
        '/setup-sms',
        async ({ body }) => {
            const { userID, phoneNumber } = body;
            const user = await UserFactorAuth.findOne({ userID });
            if (!user) throw new Error('User not found');

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.tempSecret = verificationCode;
            user.tempSecretExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await user.save();

            // Send SMS (implementation depends on your SMS provider)
            // Example with Twilio:
            // await twilioClient.messages.create({...})

            return { success: true };
        },
        {
            body: t.Object({
                userID: t.String(),
                phoneNumber: t.String()
            }),
            response: t.Object({
                success: t.Boolean()
            })
        }
    )

export default user2Fa