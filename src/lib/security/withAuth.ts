import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { hasPermission, Permission, Role } from './rbac';
import { ApiError } from '../errors/api-error';
import { logSecurityEvent } from '@/lib/logger';

/**
 * Higher-Order function to wrap Next.js API Route Handlers with RBAC enforcement.
 * Updated for Auth.js v5.
 *
 * Uses the verified Auth.js session — NOT a raw Bearer token string.
 * The role is extracted from the server-side session that was cryptographically
 * signed with AUTH_SECRET.
 *
 * Usage:
 *   export const GET = withAuth('quotes:read', async (req, ctx, session) => { ... })
 */
export function withAuth(
    requiredPermission: Permission,
    handler: (
        req: Request,
        context: any,
        session: { user: { id: string; email?: string | null; role?: string; plan?: string } }
    ) => Promise<NextResponse>
) {
    return async (req: Request, context: any): Promise<NextResponse> => {
        try {
            // ── 1. Verify the session via Auth.js v5 ────────────────────────────────
            const session = await auth();

            // ── 2. Reject unauthenticated requests ──────────────────────────────────
            if (!session?.user) {
                logSecurityEvent('api.unauthorized', 'medium', {
                    permission: requiredPermission,
                    path: new URL(req.url).pathname,
                });
                throw new ApiError(
                    'Unauthorized: Authentication required',
                    401,
                    { required: requiredPermission },
                    'https://api.insuranceclarity.in/errors/unauthorized'
                );
            }

            // ── 3. Extract the role from the verified session ────────────────────────
            const currentRole = (session.user.role ?? 'CUSTOMER') as Role;

            // ── 4. Check RBAC permission matrix ─────────────────────────────────────
            if (!hasPermission(currentRole, requiredPermission)) {
                logSecurityEvent('api.forbidden', 'high', {
                    userId: session.user.id,
                    role: currentRole,
                    requiredPermission,
                    path: new URL(req.url).pathname,
                });
                throw new ApiError(
                    'Forbidden: Insufficient privileges',
                    403,
                    { required: requiredPermission, current: currentRole },
                    'https://api.insuranceclarity.in/errors/forbidden'
                );
            }

            // ── 5. Pass session to handler (typed for Auth.js v5) ────────────────────
            return await handler(req, context, session as any);

        } catch (error) {
            if (error instanceof ApiError) {
                return NextResponse.json(error.toJSON(), { status: error.statusCode });
            }

            // Unknown server error — do NOT leak internals
            return NextResponse.json(
                {
                    type: 'about:blank',
                    title: 'Internal Server Error',
                    status: 500,
                    detail: 'An unexpected error occurred.',
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Lightweight helper — require an authenticated session without permission checks.
 */
export function withSession(
    handler: (
        req: Request,
        context: any,
        session: { user: { id: string; email?: string | null; role?: string; plan?: string } }
    ) => Promise<NextResponse>
) {
    return withAuth('quotes:read', async (req, context, session) => {
        return handler(req, context, session);
    });
}
