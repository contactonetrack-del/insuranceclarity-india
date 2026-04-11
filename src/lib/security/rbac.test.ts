import { describe, expect, it } from 'vitest';
import { hasPermission } from './rbac';

describe('rbac permissions', () => {
    it('allows authenticated roles to read session and blocks guests', () => {
        expect(hasPermission('GUEST', 'session:read')).toBe(false);
        expect(hasPermission('CUSTOMER', 'session:read')).toBe(true);
        expect(hasPermission('AGENT', 'session:read')).toBe(true);
        expect(hasPermission('ADMIN', 'session:read')).toBe(true);
    });
});
