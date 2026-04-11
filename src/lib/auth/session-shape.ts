import { getAdminEmails } from '@/lib/security/env';
import {
    normalizeUserPlan,
    normalizeUserRole,
    type UserPlan,
    type UserRole,
} from '@/lib/domain/enums';

export interface AppAuthUser {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: UserRole;
    plan?: UserPlan;
}

export interface AppAuthSession {
    user: AppAuthUser;
    expires: string;
    sessionId?: string;
}

type BetterAuthSessionLike = {
    user: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role?: string | null;
        plan?: string | null;
    };
    session: {
        id: string;
        expiresAt: Date | string;
    };
};

export function resolveAuthRole(
    email?: string | null,
    role?: string | null,
): UserRole {
    const normalizedEmail = email?.trim().toLowerCase();

    if (normalizedEmail && getAdminEmails().includes(normalizedEmail)) {
        return 'ADMIN';
    }

    return normalizeUserRole(role);
}

export function resolveAuthPlan(plan?: string | null): UserPlan {
    return normalizeUserPlan(plan);
}

export function normalizeDisplayName(
    name?: string | null,
    email?: string | null,
): string | null {
    const normalizedName = name?.trim();
    if (normalizedName) {
        return normalizedName;
    }

    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
        return null;
    }

    return normalizedEmail.split('@')[0] || null;
}

export function toAppAuthSession(
    session: BetterAuthSessionLike | null | undefined,
): AppAuthSession | null {
    if (!session?.user || !session.session) {
        return null;
    }

    const expiresAt =
        session.session.expiresAt instanceof Date
            ? session.session.expiresAt.toISOString()
            : new Date(session.session.expiresAt).toISOString();

    return {
        user: {
            id: session.user.id,
            email: session.user.email ?? null,
            name: normalizeDisplayName(session.user.name, session.user.email),
            image: session.user.image ?? null,
            role: resolveAuthRole(session.user.email, session.user.role),
            plan: resolveAuthPlan(session.user.plan),
        },
        expires: expiresAt,
        sessionId: session.session.id,
    };
}
