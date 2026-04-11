import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

const {
    mockAuth,
    mockCountErrorLogs,
    mockGroupAffectedUsers,
    mockGroupErrorLogsByCode,
    mockGroupErrorLogsByRoute,
    mockGroupErrorLogsBySeverity,
    mockGroupErrorLogsByStatus,
    mockListRateLimitAnomaliesSince,
    mockListRecentErrors,
    mockInfo,
    mockError,
} = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockCountErrorLogs: vi.fn(),
    mockGroupAffectedUsers: vi.fn(),
    mockGroupErrorLogsByCode: vi.fn(),
    mockGroupErrorLogsByRoute: vi.fn(),
    mockGroupErrorLogsBySeverity: vi.fn(),
    mockGroupErrorLogsByStatus: vi.fn(),
    mockListRateLimitAnomaliesSince: vi.fn(),
    mockListRecentErrors: vi.fn(),
    mockInfo: vi.fn(),
    mockError: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/services/ops.service', () => ({
    countErrorLogs: mockCountErrorLogs,
    groupAffectedUsers: mockGroupAffectedUsers,
    groupErrorLogsByCode: mockGroupErrorLogsByCode,
    groupErrorLogsByRoute: mockGroupErrorLogsByRoute,
    groupErrorLogsBySeverity: mockGroupErrorLogsBySeverity,
    groupErrorLogsByStatus: mockGroupErrorLogsByStatus,
    listRateLimitAnomaliesSince: mockListRateLimitAnomaliesSince,
    listRecentErrors: mockListRecentErrors,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: mockInfo,
        error: mockError,
    },
}));

describe('GET /api/admin/errors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects unauthenticated users', async () => {
        mockAuth.mockResolvedValue(null);

        const response = await GET(new NextRequest('http://localhost:3000/api/admin/errors'));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects non-admin users', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'USER' } });

        const response = await GET(new NextRequest('http://localhost:3000/api/admin/errors'));
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('FORBIDDEN');
    });

    it('returns aggregated admin error data for admins', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } });
        mockGroupErrorLogsByCode.mockResolvedValue([{ errorCode: 'E1', severity: 'HIGH', _count: { id: 3 } }]);
        mockGroupErrorLogsByRoute.mockResolvedValue([{ route: '/api/demo', method: 'GET', _count: { id: 2 } }]);
        mockGroupErrorLogsByStatus.mockResolvedValue([{ httpStatus: 500, _count: { id: 2 } }]);
        mockGroupErrorLogsBySeverity.mockResolvedValue([{ severity: 'HIGH', _count: { id: 3 } }]);
        mockListRecentErrors.mockResolvedValue([{ errorCode: 'E1', message: 'Boom', severity: 'HIGH' }]);
        mockListRateLimitAnomaliesSince.mockResolvedValue([
            { ipAddress: '127.0.0.1', scope: 'auth', requestCount: 12, windowSeconds: 60, detectedAt: new Date('2024-01-01T00:00:00Z') },
        ]);
        mockGroupAffectedUsers.mockResolvedValue([{ userId: 'user_1', _count: { id: 4 } }]);
        mockCountErrorLogs.mockResolvedValue(7);

        const response = await GET(
            new NextRequest(
                'http://localhost:3000/api/admin/errors?days=14&severity=HIGH&route=%2Fapi%2Fdemo&errorCode=E1',
            ),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.summary).toEqual({
            totalErrors: 7,
            uniqueErrorCodes: 1,
            affectedRoutes: 1,
            affectedUsers: 1,
        });
        expect(json.data.topErrors).toEqual([{ code: 'E1', message: 'Boom', severity: 'HIGH' }]);
        expect(mockGroupErrorLogsByCode).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'HIGH',
                route: { contains: '/api/demo' },
                errorCode: 'E1',
            }),
        );
        expect(mockInfo).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'admin.errors.dashboard', totalErrors: 7 }),
        );
    });

    it('returns a 500 error when aggregation fails', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } });
        mockGroupErrorLogsByCode.mockRejectedValue(new Error('database unavailable'));

        const response = await GET(new NextRequest('http://localhost:3000/api/admin/errors'));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'admin.errors.failed', error: 'database unavailable' }),
        );
    });
});
