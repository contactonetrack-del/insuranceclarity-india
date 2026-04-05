import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/lib/cache/redis";
import { sendOtpEmail } from "@/services/email.service";
import { logger } from "@/lib/logger";
import { randomInt } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, locale = 'en' } = body;

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
        }

        // Generate a cryptographically secure 6-digit OTP
        const otpCode = randomInt(100000, 999999).toString();

        // Check if Upstash Redis is configured. If not, fail or mock?
        // Production requires it, but we can fall back to returning the OTP if strictly needed (not safe for prod).
        if (!redisClient.isConfigured()) {
            logger.warn({ action: "otp.redis.missing", email, msg: "Redis not configured. Cannot store OTP." });
            return NextResponse.json({ error: "Internal server error: Queue/Cache missing." }, { status: 500 });
        }

        const otpKey = `auth:otp:${email.toLowerCase()}`;
        
        // Use rate limiting on OTP sends (e.g. max 3 per min per email)
        const attemptsKey = `rate:otp:${email.toLowerCase()}`;
        
        // Atomic rate limiting using a Lua script via Upstash eval
        // Max 3 attempts per 60 seconds.
        const luaScript = `
            local current = redis.call("INCR", KEYS[1])
            if current == 1 then
                redis.call("EXPIRE", KEYS[1], 60)
            end
            return current
        `;
        const attempts = await redisClient.eval(luaScript, [attemptsKey], []) as number;
        
        if (attempts > 3) {
            logger.warn({ action: "otp.rate_limit_exceeded", email });
            return NextResponse.json({ error: "Too many OTP requests. Please wait a minute." }, { status: 429 });
        }

        // Store OTP in Redis for 5 minutes (300 seconds)
        await redisClient.set(otpKey, otpCode, { ex: 300 });

        // Send Email
        const emailSent = await sendOtpEmail(email, { otp: otpCode, locale });
        
        if (!emailSent) {
            return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
        }

        logger.info({ action: "otp.sent", email });

        return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
    } catch (error) {
        logger.error({ action: "otp.send.fail", error: String(error) });
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
