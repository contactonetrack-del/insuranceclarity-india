import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

const { mockGetAuthSession } = vi.hoisted(() => ({
    mockGetAuthSession: vi.fn(),
}));

const {
    mockFindUserIdByEmail,
    mockFindHistoryByIdForUser,
    mockListHistoriesByUser,
} = vi.hoisted(() => ({
    mockFindUserIdByEmail: vi.fn(),
    mockFindHistoryByIdForUser: vi.fn(),
    mockListHistoriesByUser: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
    getAuthSession: mockGetAuthSession,
}));

vi.mock('@/services/advisor-history.service', () => ({
    findUserIdByEmail: mockFindUserIdByEmail,
    findAdvisorHistoryById: mockFindHistoryByIdForUser,
    listAdvisorHistories: mockListHistoriesByUser,
    createAdvisorHistory: vi.fn(),
    updateAdvisorHistory: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
    },
}));

describe('GET /api/advisor/history', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetAuthSession.mockResolvedValue({
            user: { email: 'advisor@example.com' },
        });
        mockFindUserIdByEmail.mockResolvedValue({ id: 'user_1' });
    });

    it('returns unauthorized when session is missing', async () => {
        mockGetAuthSession.mockResolvedValue(null);
        const request = new NextRequest('http://localhost:3000/api/advisor/history');

        const response = await GET(request);

        expect(response.status).toBe(401);
        expect(mockFindUserIdByEmail).not.toHaveBeenCalled();
    });

    it('returns history list for authenticated user', async () => {
        const histories = [{ id: 'h_1', title: 'First chat' }];
        mockListHistoriesByUser.mockResolvedValue(histories);
        const request = new NextRequest('http://localhost:3000/api/advisor/history');

        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(histories);
        expect(mockFindUserIdByEmail).toHaveBeenCalledWith('advisor@example.com');
        expect(mockListHistoriesByUser).toHaveBeenCalledWith('user_1');
    });

    it('returns one session when id query is provided', async () => {
        const history = { id: 'h_2', title: 'Saved thread', userId: 'user_1' };
        mockFindHistoryByIdForUser.mockResolvedValue(history);
        const request = new NextRequest('http://localhost:3000/api/advisor/history?id=h_2');

        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(history);
        expect(mockFindHistoryByIdForUser).toHaveBeenCalledWith('h_2', 'user_1');
        expect(mockListHistoriesByUser).not.toHaveBeenCalled();
    });

    it('returns not found when user lookup fails', async () => {
        mockFindUserIdByEmail.mockResolvedValue(null);
        const request = new NextRequest('http://localhost:3000/api/advisor/history');

        const response = await GET(request);

        expect(response.status).toBe(404);
        expect(mockListHistoriesByUser).not.toHaveBeenCalled();
    });
});
