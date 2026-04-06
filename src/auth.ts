import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getGoogleOAuthConfig, requireStrongNextAuthSecret } from "@/lib/security/env";
import { logger, logSecurityEvent } from "@/lib/logger";
import { redisClient } from "@/lib/cache/redis";
import {
    normalizeEmailForOtp,
    normalizeOtpCode,
    secureOtpEquals,
} from '@/lib/security/otp';

/**
 * Auth.js v5 Configuration
 * 
 * This file replaces the NextAuth options in the API route.
 * It provides the main `auth()`, `signIn()`, and `signOut()` functions
 * used throughout the application.
 */

const googleOAuth = getGoogleOAuthConfig();
const OTP_MAX_VERIFY_ATTEMPTS = 8;
const OTP_VERIFY_WINDOW_SECONDS = 10 * 60;
const OTP_LOCK_SECONDS = 15 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    trustHost: true, // Required for reliable host header processing in Vercel
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    providers: [
        ...(googleOAuth ? [
            GoogleProvider({
                clientId: googleOAuth.clientId,
                clientSecret: googleOAuth.clientSecret,
            })
        ] : []),
        CredentialsProvider({
            id: 'email-otp',
            name: 'Email OTP',
            credentials: {
                email: { label: "Email", type: "email" },
                otp: { label: "OTP", type: "text" }
            },
            async authorize(credentials) {
                const { email, otp } = credentials ?? {};
                if (!email || !otp) {
                    throw new Error("Email and OTP are required");
                }

                const normalizedEmail = normalizeEmailForOtp(String(email));
                const normalizedOtp = normalizeOtpCode(String(otp));
                if (normalizedOtp.length !== 6) {
                    throw new Error('Invalid or expired OTP');
                }

                const otpKey = `auth:otp:${normalizedEmail}`;
                const failKey = `auth:otp:fail:${normalizedEmail}`;
                const lockKey = `auth:otp:lock:${normalizedEmail}`;

                const isLocked = await redisClient.get<string>(lockKey);
                if (isLocked) {
                    throw new Error('Too many attempts. Please request a new OTP in 15 minutes.');
                }

                const storedOtpHash = await redisClient.get<string>(otpKey);
                const otpIsValid = Boolean(storedOtpHash && secureOtpEquals(storedOtpHash, normalizedEmail, normalizedOtp));

                if (!otpIsValid) {
                    const failures = await redisClient.incr(failKey);
                    if (failures === 1) {
                        await redisClient.expire(failKey, OTP_VERIFY_WINDOW_SECONDS);
                    }

                    if (failures >= OTP_MAX_VERIFY_ATTEMPTS) {
                        await redisClient.set(lockKey, '1', { ex: OTP_LOCK_SECONDS });
                        await redisClient.del(otpKey);
                    }

                    throw new Error("Invalid or expired OTP");
                }

                await redisClient.del(otpKey);
                await redisClient.del(failKey);
                await redisClient.del(lockKey);

                let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: normalizedEmail,
                            role: 'CUSTOMER',
                        }
                    });

                    logger.info({ action: 'auth.user_created', userId: user.id, provider: 'email-otp' });
                    const { trackFunnelStep } = await import('@/lib/analytics/funnel');
                    await trackFunnelStep('signup', { userId: user.id }).catch(() => { /* non-fatal */ });
                }

                return user;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user?.id) {
                token.id = user.id;

                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true, plan: true },
                });

                const adminEmails = (process.env.ADMIN_EMAILS ?? '')
                    .split(',')
                    .map((e) => e.trim())
                    .filter(Boolean);
                const isAdmin = user.email ? adminEmails.includes(user.email) : false;

                if (isAdmin) {
                    logSecurityEvent('auth.admin_access_granted', 'medium', {
                        userId: user.id,
                        email: user.email,
                        source: 'ADMIN_EMAILS env',
                    });
                }

                token.role = isAdmin ? 'ADMIN' : (dbUser?.role ?? 'CUSTOMER');
                token.plan = dbUser?.plan ?? 'FREE';
            }

            if (trigger === 'update' && token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { role: true, plan: true },
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.plan = dbUser.plan;
                }
            }

            // Centralized session revocation via Redis
            if (token.id && redisClient.isConfigured()) {
                const isRevoked = await redisClient.get(`auth:revoked:${token.id}`).catch(() => null);
                if (isRevoked) {
                    logger.warn({ action: 'auth.session_revoked', userId: token.id });
                    return {}; // Invalidating JWT payload effectively logs out the user
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id ?? token.sub) as string;
                session.user.role = token.role as string | undefined;
                session.user.plan = token.plan as string | undefined;
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            if (user.id) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'CUSTOMER' },
                }).catch(() => { /* non-fatal */ });

                logger.info({ action: 'auth.user_created', userId: user.id });

                const { trackFunnelStep } = await import('@/lib/analytics/funnel');
                await trackFunnelStep('signup', { userId: user.id }).catch(() => { /* non-fatal */ });
            }
        },

        async signIn({ user, isNewUser }) {
            logger.info({
                action: 'auth.sign_in',
                userId: user.id,
                isNewUser: isNewUser ?? false,
            });
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: requireStrongNextAuthSecret() || undefined,
});

// ─── Type Augmentations for Auth.js v5 ─────────────────────────────────────────

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role?: string;
            plan?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role?: string;
        plan?: string;
    }

    interface JWT {
        id?: string;
        role?: string;
        plan?: string;
    }
}
