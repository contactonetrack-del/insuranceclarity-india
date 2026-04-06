import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from '@/lib/logger';

const otpSecret = process.env.OTP_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || '';

if (!otpSecret) {
    const message = 'OTP_SECRET (or NEXTAUTH_SECRET fallback) is not configured.';
    if (process.env.NODE_ENV === 'production') {
        throw new Error(message);
    }
    logger.warn({ action: 'otp.secret.missing', message });
}

const OTP_SECRET = otpSecret || 'dev-only-otp-secret';

export function normalizeEmailForOtp(email: string): string {
    return email.trim().toLowerCase();
}

export function normalizeOtpCode(otp: string): string {
    return otp.replace(/\D/g, '').slice(0, 6);
}

export function hashOtp(email: string, otp: string): string {
    const normalizedEmail = normalizeEmailForOtp(email);
    const normalizedOtp = normalizeOtpCode(otp);

    return createHmac('sha256', OTP_SECRET)
        .update(`${normalizedEmail}:${normalizedOtp}`)
        .digest('hex');
}

export function secureOtpEquals(expectedHash: string, email: string, providedOtp: string): boolean {
    const candidate = hashOtp(email, providedOtp);

    try {
        const a = Buffer.from(expectedHash, 'hex');
        const b = Buffer.from(candidate, 'hex');
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
}
