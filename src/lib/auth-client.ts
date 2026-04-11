'use client';

import type { ReactNode } from 'react';
import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';
import type { AppAuthSession } from '@/lib/auth/session-shape';
import { sanitizeRelativeCallbackUrl } from '@/lib/auth/callback-url';
import {
    normalizeUserPlan,
    normalizeUserRole,
    type UserPlan,
    type UserRole,
} from '@/lib/domain/enums';

type BetterAuthClientSession = {
    user: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role?: UserRole | null;
        plan?: UserPlan | null;
    };
    session: {
        id: string;
        expiresAt: Date | string;
    };
};

type SignInProvider = 'google' | 'email-otp';

type SignInOptions = {
    callbackUrl?: string;
    redirect?: boolean;
    email?: string;
    otp?: string;
    name?: string;
    image?: string;
};

type SignInResult = {
    ok: boolean;
    status: number;
    error?: string;
    url?: string | null;
};

type SignOutOptions = {
    callbackUrl?: string;
    redirect?: boolean;
};

type AuthSessionHookResult =
    | {
        data: AppAuthSession;
        status: 'authenticated';
        error: unknown;
        refetch: () => Promise<void>;
    }
    | {
        data: null;
        status: 'loading' | 'unauthenticated';
        error: unknown;
        refetch: () => Promise<void>;
    };

const authClient = createAuthClient({
    basePath: '/api/auth',
    plugins: [emailOTPClient()],
    sessionOptions: {
        refetchOnWindowFocus: true,
    },
});

function normalizeDisplayName(name?: string | null, email?: string | null): string | null {
    const trimmedName = name?.trim();
    if (trimmedName) {
        return trimmedName;
    }

    const trimmedEmail = email?.trim().toLowerCase();
    if (!trimmedEmail) {
        return null;
    }

    return trimmedEmail.split('@')[0] || null;
}

function toClientSession(
    session: BetterAuthClientSession | null | undefined,
): AppAuthSession | null {
    if (!session?.user || !session.session) {
        return null;
    }

    const expires =
        session.session.expiresAt instanceof Date
            ? session.session.expiresAt.toISOString()
            : new Date(session.session.expiresAt).toISOString();

    return {
        user: {
            id: session.user.id,
            email: session.user.email ?? null,
            name: normalizeDisplayName(session.user.name, session.user.email),
            image: session.user.image ?? null,
            role: normalizeUserRole(session.user.role),
            plan: normalizeUserPlan(session.user.plan),
        },
        expires,
        sessionId: session.session.id,
    };
}

function extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message
    ) {
        return error.message;
    }

    return fallback;
}

function extractErrorStatus(error: unknown): number {
    if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        typeof error.status === 'number'
    ) {
        return error.status;
    }

    return 500;
}

function extractWrappedErrorMessage(response: unknown): string | null {
    if (
        typeof response === 'object' &&
        response !== null &&
        'error' in response &&
        typeof response.error === 'object' &&
        response.error !== null &&
        'message' in response.error &&
        typeof response.error.message === 'string'
    ) {
        return response.error.message;
    }

    return null;
}

function extractWrappedStatus(response: unknown, fallback = 500): number {
    if (
        typeof response === 'object' &&
        response !== null &&
        'error' in response &&
        typeof response.error === 'object' &&
        response.error !== null &&
        'status' in response.error &&
        typeof response.error.status === 'number'
    ) {
        return response.error.status;
    }

    return fallback;
}

function extractResponseUrl(response: unknown, fallback: string): string {
    if (
        typeof response === 'object' &&
        response !== null &&
        'url' in response &&
        typeof response.url === 'string' &&
        response.url
    ) {
        return response.url;
    }

    if (
        typeof response === 'object' &&
        response !== null &&
        'data' in response &&
        typeof response.data === 'object' &&
        response.data !== null &&
        'url' in response.data &&
        typeof response.data.url === 'string' &&
        response.data.url
    ) {
        return response.data.url;
    }

    return fallback;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
    return children;
}

export async function signIn(
    provider: SignInProvider,
    options?: SignInOptions,
): Promise<SignInResult> {
    const callbackUrl = sanitizeRelativeCallbackUrl(options?.callbackUrl, '/dashboard');

    try {
        if (provider === 'google') {
            const response = await authClient.signIn.social({
                provider: 'google',
                callbackURL: callbackUrl,
                disableRedirect: options?.redirect === false,
            });

            const wrappedError = extractWrappedErrorMessage(response);
            if (wrappedError) {
                return {
                    ok: false,
                    status: extractWrappedStatus(response),
                    error: wrappedError,
                    url: null,
                };
            }

            return {
                ok: true,
                status: 200,
                url: extractResponseUrl(response, callbackUrl),
            };
        }

        if (provider === 'email-otp') {
            const email = options?.email?.trim();
            const otp = options?.otp?.trim();

            if (!email || !otp) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Email and OTP are required.',
                    url: null,
                };
            }

            const response = await authClient.signIn.emailOtp({
                email,
                otp,
                ...(options?.name ? { name: options.name } : {}),
                ...(options?.image ? { image: options.image } : {}),
            });

            const wrappedError = extractWrappedErrorMessage(response);
            if (wrappedError) {
                return {
                    ok: false,
                    status: extractWrappedStatus(response),
                    error: wrappedError,
                    url: null,
                };
            }

            return {
                ok: true,
                status: 200,
                url: callbackUrl,
            };
        }

        return {
            ok: false,
            status: 400,
            error: 'Unsupported sign-in provider.',
            url: null,
        };
    } catch (error) {
        return {
            ok: false,
            status: extractErrorStatus(error),
            error: extractErrorMessage(error, 'Authentication failed. Please try again.'),
            url: null,
        };
    }
}

export async function signOut(
    options?: SignOutOptions,
): Promise<{ ok: boolean; url: string }> {
    const callbackUrl = sanitizeRelativeCallbackUrl(options?.callbackUrl, '/');

    await authClient.signOut();

    if (options?.redirect !== false && typeof window !== 'undefined') {
        window.location.assign(callbackUrl);
    }

    return {
        ok: true,
        url: callbackUrl,
    };
}

export function useAuthSession(): AuthSessionHookResult {
    const { data, error, isPending, refetch } = authClient.useSession();
    const session = toClientSession(data as BetterAuthClientSession | null | undefined);

    if (isPending) {
        return {
            data: null,
            status: 'loading',
            error,
            refetch,
        };
    }

    if (session) {
        return {
            data: session,
            status: 'authenticated',
            error,
            refetch,
        };
    }

    return {
        data: null,
        status: 'unauthenticated',
        error,
        refetch,
    };
}

export { authClient };
