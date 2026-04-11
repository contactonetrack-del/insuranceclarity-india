import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendSignInOtp } from '@/auth';
import { ErrorFactory } from '@/lib/api/error-response';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { normalizeEmailForOtp } from '@/lib/security/otp';

const otpSendSchema = z.object({
    email: z.string().trim().email("Valid email is required"),
    locale: z.enum(['en', 'hi']).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(req);
        if (csrfError) return csrfError;

        const parsed = otpSendSchema.safeParse(await req.json());
        if (!parsed.success) {
            return ErrorFactory.validationError(parsed.error.issues[0]?.message ?? 'Invalid payload');
        }

        const { email, locale = 'en' } = parsed.data;
        const normalizedEmail = normalizeEmailForOtp(email);
        await sendSignInOtp(normalizedEmail, locale, req.headers);

        logger.info({ action: 'otp.sent', email: normalizedEmail });

        return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'otp.send.fail', error: message });

        if (/too many|rate limit/i.test(message)) {
            return ErrorFactory.rateLimitExceeded('Too many OTP requests. Please wait before trying again.');
        }

        if (/invalid email/i.test(message)) {
            return ErrorFactory.validationError('Valid email is required');
        }

        return ErrorFactory.internalServerError('Failed to process request');
    }
}
