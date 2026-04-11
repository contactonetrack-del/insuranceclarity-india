import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

const { mockAuth, mockCreateUserCalculation } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockCreateUserCalculation: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/services/calculation.service', () => ({
    createUserCalculation: mockCreateUserCalculation,
}));

describe('POST /api/user/calculations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when unauthenticated', async () => {
        mockAuth.mockResolvedValue(null);
        const request = new NextRequest('http://localhost:3000/api/user/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium', inputData: { age: 30 }, result: { premium: 1200 } }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockCreateUserCalculation).not.toHaveBeenCalled();
    });

    it('returns 400 when required fields are missing', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'user_1' } });
        const request = new NextRequest('http://localhost:3000/api/user/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium' }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toEqual({ error: 'Missing required fields' });
        expect(mockCreateUserCalculation).not.toHaveBeenCalled();
    });

    it('creates calculation for authenticated user', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'user_1' } });
        const saved = { id: 'calc_1', type: 'premium' };
        mockCreateUserCalculation.mockResolvedValue(saved);
        const request = new NextRequest('http://localhost:3000/api/user/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium', inputData: { age: 30 }, result: { premium: 1200 } }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(saved);
        expect(mockCreateUserCalculation).toHaveBeenCalledWith({
            userId: 'user_1',
            type: 'premium',
            inputData: { age: 30 },
            result: { premium: 1200 },
        });
    });

    it('returns 500 when service throws', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mockAuth.mockResolvedValue({ user: { id: 'user_1' } });
        mockCreateUserCalculation.mockRejectedValue(new Error('db failed'));
        const request = new NextRequest('http://localhost:3000/api/user/calculations', {
            method: 'POST',
            body: JSON.stringify({ type: 'premium', inputData: { age: 30 }, result: { premium: 1200 } }),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'db failed' });
        consoleError.mockRestore();
    });
});
