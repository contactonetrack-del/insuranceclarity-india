import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { hasPermission, type Permission, type Role } from './rbac';
import { ApiError } from '../errors/api-error';
import { logSecurityEvent } from '@/lib/logger';
import type { AppAuthSession } from '@/lib/auth/session-shape';

/**
 * Higher-order helper for RBAC-protected route handlers.
 */
export function withAuth<TContext = unknown>(
    requiredPermission: Permission,
    handler: (
        req: Request,
        context: TContext,
        session: AppAuthSession
    ) => Promise<NextResponse>
) {
    return async (req: Request, context: TContext): Promise<NextResponse> => {
        try {
            const session = await auth();

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

            const currentRole = (session.user.role ?? 'CUSTOMER') as Role;

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

            return await handler(req, context, session);
        } catch (error) {
            if (error instanceof ApiError) {
                return NextResponse.json(error.toJSON(), { status: error.statusCode });
            }

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
 * Require only an authenticated session without extra RBAC branching.
 */
export function withSession<TContext = unknown>(
    handler: (
        req: Request,
        context: TContext,
        session: AppAuthSession
    ) => Promise<NextResponse>
) {
    return withAuth<TContext>('session:read', async (req, context, session) => {
        return handler(req, context, session);
    });
}
