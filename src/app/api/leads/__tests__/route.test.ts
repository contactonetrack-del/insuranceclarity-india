import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type NextRequest } from 'next/server';
import { POST } from '../route';

const { mockLeadCreate, mockEnforceRateLimit } = vi.hoisted(() => ({
    mockLeadCreate: vi.fn(),
    mockEnforceRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock('@/repositories/lead.repository', () => ({
    leadRepository: {
        create: mockLeadCreate,
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock CSRF so tests don't need to set headers
vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: vi.fn().mockReturnValue(null), // null = pass
}));

vi.mock('@/lib/security/rate-limit', () => ({
    enforceRateLimit: mockEnforceRateLimit,
}));

describe('POST /api/leads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEnforceRateLimit.mockResolvedValue({ allowed: true });
    });

    const createMockRequest = (body: unknown) => {
        return new Request('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }) as unknown as NextRequest;
    };

    it('should successfully create a valid lead', async () => {
        const payload = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210',
            insuranceType: 'Health Insurance',
            sourceUrl: 'http://localhost:3000/insurance/health-insurance'
        };

        mockLeadCreate.mockResolvedValue({ id: 'lead_123' });

        const response = await POST(createMockRequest(payload));
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.data.leadId).toBe('lead_123');
        expect(mockLeadCreate).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210',
            insuranceType: 'Health Insurance',
            source: 'ORGANIC',
            status: 'NEW',
            notes: 'Source context: http://localhost:3000/insurance/health-insurance'
        });
        expect(mockEnforceRateLimit).toHaveBeenCalledWith(expect.objectContaining({
            scope: 'leads',
            limit: 5,
            windowSeconds: 3600,
        }));
    });

    it('returns 429 when rate limit is exceeded', async () => {
        const payload = {
            name: 'Rate Limited',
            email: 'limited@example.com',
            phone: '9876543210',
            insuranceType: 'Health Insurance',
        };

        mockEnforceRateLimit.mockResolvedValue({
            allowed: false,
            retryAfterSeconds: 120,
        });

        const response = await POST(createMockRequest(payload));
        const json = await response.json();

        expect(response.status).toBe(429);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(mockLeadCreate).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email address', async () => {
        const payload = {
            name: 'John Doe',
            email: 'invalid-email',
            phone: '9876543210',
            insuranceType: 'Health'
        };

        const response = await POST(createMockRequest(payload));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toBeDefined();
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockLeadCreate).not.toHaveBeenCalled();
    });

    it('should default source to ORGANIC when sourceUrl is absent', async () => {
        const payload = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '1234567890',
            insuranceType: 'Term Life'
        };

        mockLeadCreate.mockResolvedValue({ id: 'lead_456' });

        await POST(createMockRequest(payload));

        expect(mockLeadCreate).toHaveBeenCalledWith(expect.objectContaining({ source: 'ORGANIC' }));
    });

    it('should map tracked campaign traffic to PAID source', async () => {
        const payload = {
            name: 'Paid Lead',
            email: 'paid@example.com',
            phone: '9876543210',
            insuranceType: 'Health Insurance',
            sourceUrl: 'https://insuranceclarity.com/health?utm_medium=cpc&gclid=test123'
        };

        mockLeadCreate.mockResolvedValue({ id: 'lead_789' });

        await POST(createMockRequest(payload));

        expect(mockLeadCreate).toHaveBeenCalledWith(expect.objectContaining({ source: 'PAID' }));
    });
});
