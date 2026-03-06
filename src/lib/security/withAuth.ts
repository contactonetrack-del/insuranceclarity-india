import { NextResponse } from 'next/server';
import { hasPermission, Permission, Role } from './rbac';
import { ApiError } from '../errors/api-error';

/**
 * A Higher-Order function to wrap Next.js API Route Handlers with RBAC enforcement.
 * 
 * In a real application, the `role` would be extracted from a verified 
 * JWT session token (e.g., via NextAuth or Clerk).
 */
export function withAuth(
    requiredPermission: Permission,
    handler: (req: Request, ...args: any[]) => Promise<NextResponse>
) {
    return async (req: Request, ...args: any[]) => {
        try {
            // MOCK: In reality, decode the JWT from Authorization header or Cookies
            // const session = await getSession(req);
            // const userRole = session?.user?.role || 'GUEST';

            const authorizationHeader = req.headers.get('Authorization');

            // For demonstration, if no token is provided, assume GUEST.
            // If a token is provided (like "Bearer CUSTOMER"), parse it.
            let currentRole: Role = 'GUEST';

            if (authorizationHeader?.startsWith('Bearer ')) {
                const token = authorizationHeader.split(' ')[1];
                if (['CUSTOMER', 'AGENT', 'ADMIN'].includes(token)) {
                    currentRole = token as Role;
                }
            }

            if (!hasPermission(currentRole, requiredPermission)) {
                throw new ApiError(
                    'Forbidden',
                    403,
                    { required: requiredPermission, current: currentRole },
                    'https://api.insuranceclarity.com/errors/forbidden'
                );
            }

            return await handler(req, ...args);
        } catch (error) {
            if (error instanceof ApiError) {
                return NextResponse.json(error.toJSON(), { status: error.statusCode });
            }

            return NextResponse.json(
                { type: 'about:blank', title: 'Internal Server Error', status: 500 },
                { status: 500 }
            );
        }
    };
}
