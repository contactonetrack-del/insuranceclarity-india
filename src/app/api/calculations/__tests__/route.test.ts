import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

const { mockGetAuthSession, mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockGetAuthSession: vi.fn(),
    mockValidateCsrfRequest: vi.fn(),
}));

const {
    mockCreateUserCalculation,
    mockFindUserIdByEmail,
    mockListUserCalculationsByUserId,
} = vi.hoisted(() => ({
    mockCreateUserCalculation: vi.fn(),
    mockFindUserIdByEmail: vi.fn(),
    mockListUserCalculationsByUserId: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
    getAuthSession: mockGetAuthSession,
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/services/calculation.service', () => ({
    createUserCalculation: mockCreateUserCalculation,
    findUserIdByEmail: mockFindUserIdByEmail,
    listUserCalculationsByUserId: mockListUserCalculationsByUserId,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
    },
}));

describe('/api/calculations route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockValidateCsrfRequest.mockReturnValue(null);
    });

    it('POST returns success message for anonymous users without saving', async () => {
        mockGetAuthSession.mockResolvedValue(null);
        const request = new NextRequest('http://localhost:3000/api/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium', inputData: { age: 30 }, result: { premium: 999 } }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, message: 'Not logged in, calculation not saved' });
        expect(mockCreateUserCalculation).not.toHaveBeenCalled();
    });

    it('POST returns validation error when fields are missing', async () => {
        mockGetAuthSession.mockResolvedValue({ user: { email: 'calc@example.com' } });
        mockFindUserIdByEmail.mockResolvedValue({ id: 'user_1' });
        const request = new NextRequest('http://localhost:3000/api/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium' }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockCreateUserCalculation).not.toHaveBeenCalled();
    });

    it('POST saves calculation for authenticated users', async () => {
        mockGetAuthSession.mockResolvedValue({ user: { email: 'calc@example.com' } });
        mockFindUserIdByEmail.mockResolvedValue({ id: 'user_1' });
        const savedCalculation = { id: 'calc_1', type: 'premium' };
        mockCreateUserCalculation.mockResolvedValue(savedCalculation);
        const request = new NextRequest('http://localhost:3000/api/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium', inputData: { age: 30 }, result: { premium: 999 } }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json).toEqual({ success: true, data: savedCalculation });
        expect(mockCreateUserCalculation).toHaveBeenCalledWith({
            userId: 'user_1',
            type: 'premium',
            inputData: { age: 30 },
            result: { premium: 999 },
        });
    });

    it('GET rejects anonymous users', async () => {
        mockGetAuthSession.mockResolvedValue(null);

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('UNAUTHORIZED');
        expect(mockListUserCalculationsByUserId).not.toHaveBeenCalled();
    });

    it('GET returns saved calculations for authenticated users', async () => {
        mockGetAuthSession.mockResolvedValue({ user: { email: 'calc@example.com' } });
        mockFindUserIdByEmail.mockResolvedValue({ id: 'user_1' });
        const calculations = [{ id: 'calc_1', type: 'premium' }];
        mockListUserCalculationsByUserId.mockResolvedValue(calculations);

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, data: calculations });
        expect(mockListUserCalculationsByUserId).toHaveBeenCalledWith('user_1', 20);
    });
});
