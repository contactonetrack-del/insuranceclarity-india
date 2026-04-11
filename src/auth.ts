import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { nextCookies, toNextJsHandler } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
    getBetterAuthBaseUrl,
    getGoogleOAuthConfig,
    requireStrongBetterAuthSecret,
} from '@/lib/security/env';
import { logger } from '@/lib/logger';
import { sendOtpEmail } from '@/services/email.service';
import { isE2eOtpHarnessEnabled, setE2eOtp } from '@/lib/auth/e2e-otp-store';
import {
    resolveAuthPlan,
    resolveAuthRole,
    toAppAuthSession,
    type AppAuthSession,
} from '@/lib/auth/session-shape';

const googleOAuth = getGoogleOAuthConfig();
const betterAuthBaseUrl = getBetterAuthBaseUrl();
const betterAuthDatabaseRateLimitEnabled =
    (process.env.BETTER_AUTH_DB_RATE_LIMIT_ENABLED?.trim() ?? '')
        .toLowerCase() === 'true' ||
    (process.env.BETTER_AUTH_DB_RATE_LIMIT_ENABLED == null &&
        process.env.NODE_ENV === 'production');

function getAllowedHosts(): string[] {
    const allowedHosts = new Set<string>([
        'localhost:3000',
        '127.0.0.1:3000',
        '*.vercel.app',
    ]);

    try {
        allowedHosts.add(new URL(betterAuthBaseUrl).host);
    } catch {
        // Base URL validation is handled by env helpers.
    }

    return [...allowedHosts];
}

function withLocaleHeader(source: Headers, locale?: string): Headers {
    const nextHeaders = new Headers(source);
    if (locale) {
        nextHeaders.set('x-auth-locale', locale);
    }
    return nextHeaders;
}

export const authApi = betterAuth({
    appName: 'Insurance Clarity',
    baseURL: {
        allowedHosts: getAllowedHosts(),
        fallback: betterAuthBaseUrl,
        protocol: process.env.NODE_ENV === 'development' ? 'http' : 'auto',
    },
    basePath: '/api/auth',
    secret: requireStrongBetterAuthSecret(),
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
        transaction: true,
    }),
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: googleOAuth
        ? {
            google: {
                clientId: googleOAuth.clientId,
                clientSecret: googleOAuth.clientSecret,
                prompt: 'select_account consent',
            },
        }
        : {},
    user: {
        modelName: 'User',
        fields: {
            emailVerified: 'betterAuthEmailVerified',
        },
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'CUSTOMER',
                input: false,
            },
            plan: {
                type: 'string',
                required: false,
                defaultValue: 'FREE',
                input: false,
            },
        },
    },
    session: {
        modelName: 'AuthSession',
        cookieCache: {
            enabled: true,
            maxAge: 300,
        },
    },
    account: {
        modelName: 'AuthAccount',
        accountLinking: {
            trustedProviders: ['google'],
        },
        encryptOAuthTokens: true,
    },
    verification: {
        modelName: 'AuthVerification',
        storeIdentifier: 'hashed',
    },
    ...(betterAuthDatabaseRateLimitEnabled
        ? {
            rateLimit: {
                enabled: true,
                storage: 'database' as const,
                modelName: 'AuthRateLimit',
                window: 60,
                max: 100,
                customRules: {
                    '/email-otp/send-verification-otp': {
                        window: 60,
                        max: 3,
                    },
                    '/sign-in/email-otp': {
                        window: 600,
                        max: 8,
                    },
                    '/sign-in/social': {
                        window: 60,
                        max: 20,
                    },
                },
            },
        }
        : {}),
    advanced: {
        trustedProxyHeaders: true,
        cookiePrefix: 'insurance-clarity',
        cookies: {
            session_token: {
                name:
                    process.env.NODE_ENV === 'production'
                        ? '__Secure-insurance-clarity.session-token'
                        : 'insurance-clarity.session-token',
                attributes: {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                },
            },
        },
    },
    plugins: [
        nextCookies(),
        emailOTP({
            otpLength: 6,
            expiresIn: 300,
            allowedAttempts: 8,
            disableSignUp: false,
            storeOTP: 'hashed',
            ...(betterAuthDatabaseRateLimitEnabled
                ? {
                    rateLimit: {
                        window: 60,
                        max: 3,
                    },
                }
                : {}),
            async sendVerificationOTP(data, ctx) {
                const localeHeader = ctx?.request?.headers.get('x-auth-locale') ?? undefined;
                const locale =
                    localeHeader?.toLowerCase().startsWith('hi') ? 'hi' : 'en';

                if (isE2eOtpHarnessEnabled()) {
                    setE2eOtp(data.email, data.otp);
                    logger.info({
                        action: 'otp.sent.e2e',
                        email: data.email,
                    });
                    return;
                }

                const sent = await sendOtpEmail(data.email, {
                    otp: data.otp,
                    locale,
                });

                if (!sent) {
                    throw new Error('Failed to send OTP email');
                }
            },
        }),
    ],
    databaseHooks: {
        user: {
            create: {
                async before(data) {
                    return {
                        data: {
                            ...data,
                            role: resolveAuthRole(data.email, data.role as string | null | undefined),
                            plan: resolveAuthPlan(data.plan as string | null | undefined),
                        },
                    };
                },
                async after(user) {
                    logger.info({
                        action: 'auth.user_created',
                        userId: user.id,
                    });

                    if (user.emailVerified) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                emailVerified: new Date(),
                            },
                        }).catch(() => undefined);
                    }

                    const { trackFunnelStep } = await import('@/lib/analytics/funnel');
                    await trackFunnelStep('signup', { userId: user.id }).catch(() => undefined);
                },
            },
            update: {
                async before(data) {
                    return {
                        data: {
                            ...data,
                            ...(data.email
                                ? {
                                    role: resolveAuthRole(
                                        data.email as string,
                                        data.role as string | null | undefined,
                                    ),
                                }
                                : {}),
                            ...(data.plan
                                ? { plan: resolveAuthPlan(data.plan as string) }
                                : {}),
                        },
                    };
                },
            },
        },
        session: {
            create: {
                async after(session) {
                    logger.info({
                        action: 'auth.sign_in',
                        userId: session.userId,
                        sessionId: session.id,
                    });

                    const user = await prisma.user.findUnique({
                        where: { id: session.userId },
                        select: {
                            email: true,
                            role: true,
                            plan: true,
                        },
                    });

                    if (!user) {
                        return;
                    }

                    const nextRole = resolveAuthRole(user.email, user.role);
                    const nextPlan = resolveAuthPlan(user.plan);

                    if (nextRole !== user.role || nextPlan !== user.plan) {
                        await prisma.user.update({
                            where: { id: session.userId },
                            data: {
                                role: nextRole,
                                plan: nextPlan,
                            },
                        }).catch(() => undefined);
                    }
                },
            },
        },
    },
});

export const handlers = toNextJsHandler(authApi);

type HeaderSource = Headers | Request | null | undefined;

async function resolveHeaders(source?: HeaderSource): Promise<Headers> {
    if (source instanceof Headers) {
        return source;
    }

    if (source instanceof Request) {
        return source.headers;
    }

    return new Headers(await headers());
}

export async function auth(source?: HeaderSource): Promise<AppAuthSession | null> {
    const session = await authApi.api.getSession({
        headers: await resolveHeaders(source),
    });

    return toAppAuthSession(session);
}

export async function sendSignInOtp(
    email: string,
    locale?: string,
    source?: HeaderSource,
): Promise<void> {
    const requestHeaders = await resolveHeaders(source);

    await authApi.api.sendVerificationOTP({
        headers: withLocaleHeader(requestHeaders, locale),
        body: {
            email,
            type: 'sign-in',
        },
    });
}
