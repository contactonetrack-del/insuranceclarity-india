import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/lib/cache/redis";
import { sendOtpEmail } from "@/services/email.service";
import { logger } from "@/lib/logger";
import { randomInt } from "crypto";
import { z } from "zod";
import { validateCsrfRequest } from "@/lib/security/csrf";
import { hashOtp, normalizeEmailForOtp } from '@/lib/security/otp';
import { ErrorFactory } from '@/lib/api/error-response';

const otpSendSchema = z.object({
    email: z.string().trim().email("Valid email is required"),
    locale: z.enum(['en', 'hi']).optional(),
});

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

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
        const requestIp = getClientIp(req);


        // Generate a cryptographically secure 6-digit OTP
        const otpCode = randomInt(100000, 1000000).toString();
        const otpHash = hashOtp(normalizedEmail, otpCode);

        // Check if Upstash Redis is configured. If not, fail or mock?
        // Production requires it, but we can fall back to returning the OTP if strictly needed (not safe for prod).
        if (!redisClient.isConfigured()) {
            logger.warn({ action: "otp.redis.missing", email: normalizedEmail, msg: "Redis not configured. Cannot store OTP." });
            return ErrorFactory.internalServerError("Internal server error: Queue/Cache missing.");
        }

        const otpKey = `auth:otp:${normalizedEmail}`;

        // Use rate limiting on OTP sends (e.g. max 3 per min per email)
        const attemptsKey = `rate:otp:${normalizedEmail}`;
        const attemptsIpKey = requestIp ? `rate:otp:ip:${requestIp}` : null;
        const cooldownKey = `otp:cooldown:${normalizedEmail}`;

        const inCooldown = await redisClient.get<string>(cooldownKey);
        if (inCooldown) {
            return ErrorFactory.rateLimitExceeded('Please wait a few seconds before requesting another OTP.');
        }

        // Atomic rate limiting using a Lua script via Upstash eval
        // Max 3 attempts per 60 seconds.
        const luaScript = `
            local current = redis.call("INCR", KEYS[1])
            if current == 1 then
                redis.call("EXPIRE", KEYS[1], 60)
            end
            return current
        `;
        const attempts = await redisClient.eval<number>(luaScript, [attemptsKey], []);

        if (attempts === null) {
            return ErrorFactory.serviceUnavailable("Service temporarily unavailable. Please try again.");
        }

        if (attempts > 3) {
            logger.warn({ action: "otp.rate_limit_exceeded", email: normalizedEmail });
            return ErrorFactory.rateLimitExceeded("Too many OTP requests. Please wait a minute.");
        }

        if (attemptsIpKey) {
            const ipAttempts = await redisClient.eval<number>(luaScript, [attemptsIpKey], []);
            if (ipAttempts !== null && ipAttempts > 20) {
                logger.warn({ action: 'otp.rate_limit_exceeded.ip', ip: requestIp });
                return ErrorFactory.rateLimitExceeded('Too many OTP requests from your network. Please wait a minute.');
            }
        }

        // Store OTP in Redis for 5 minutes (300 seconds)
        await redisClient.set(otpKey, otpHash, { ex: 300 });
        await redisClient.set(cooldownKey, '1', { ex: 30 });

        // Send Email
        const emailSent = await sendOtpEmail(normalizedEmail, { otp: otpCode, locale });

        if (!emailSent) {
            return ErrorFactory.internalServerError("Failed to send email. Please try again.");
        }

        logger.info({ action: "otp.sent", email: normalizedEmail });

        return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
    } catch (error) {
        logger.error({ action: "otp.send.fail", error: String(error) });
        return ErrorFactory.internalServerError("Failed to process request");
    }
}
