import type { UserRole } from '@/lib/domain/enums';

/**
 * Role-Based Access Control (RBAC) Definitions
 * 
 * Defines the strict authorization matrix for the platform.
 */

export type Role = UserRole;

export type Permission =
    | 'session:read'
    | 'quotes:read'
    | 'quotes:write'
    | 'policies:read'
    | 'policies:write'
    | 'claims:read'
    | 'claims:write'
    | 'users:read'
    | 'users:write';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    GUEST: ['quotes:write'], // Guests can only generate new quotes
    CUSTOMER: [
        'session:read',
        'quotes:read',
        'quotes:write',
        'policies:read',
        'claims:read',
        'claims:write', // Customers can file claims against their policies
    ],
    AGENT: [
        'session:read',
        'quotes:read',
        'quotes:write',
        'policies:read',
        'policies:write', // Agents can bind policies for customers
        'claims:read',
        'users:read',
    ],
    ADMIN: [
        'session:read',
        'quotes:read',
        'quotes:write',
        'policies:read',
        'policies:write',
        'claims:read',
        'claims:write',
        'users:read',
        'users:write',
    ],
};

/**
 * Validates if a designated Role possesses a specific Permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
