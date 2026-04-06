import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type NextRequest } from 'next/server';
import { POST } from '../route';

// vi.hoisted ensures mockCreate is defined before vi.mock is hoisted
const { mockCreate } = vi.hoisted(() => ({
    mockCreate: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        lead: {
            create: mockCreate,
        }
    }
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

describe('POST /api/leads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

        mockCreate.mockResolvedValue({ id: 'lead_123' });

        const response = await POST(createMockRequest(payload));
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.data.leadId).toBe('lead_123');
        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '9876543210',
                insuranceType: 'Health Insurance',
                source: 'http://localhost:3000/insurance/health-insurance',
                status: 'NEW'
            }
        });
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
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should default source to ORGANIC when sourceUrl is absent', async () => {
        const payload = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '1234567890',
            insuranceType: 'Term Life'
        };

        mockCreate.mockResolvedValue({ id: 'lead_456' });

        await POST(createMockRequest(payload));

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ source: 'ORGANIC' })
        }));
    });
});
