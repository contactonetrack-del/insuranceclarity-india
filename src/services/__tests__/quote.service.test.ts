import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteService } from '../quote.service';
import { quoteRepository } from '@/repositories/quote.repository';
import { queue } from '@/lib/queue/jobs';

vi.mock('@/repositories/quote.repository', () => ({
    quoteRepository: {
        create: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn()
    }
}));

// Queue mock removed as queue is no longer used for quotes

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    }
}));

describe('QuoteService', () => {
    let service: QuoteService;

    const mockDate = new Date('2024-01-01T00:00:00Z');

    beforeEach(() => {
        service = new QuoteService();
        vi.clearAllMocks();
        vi.setSystemTime(mockDate);
    });

    it('should generate a quote successfully for valid input', async () => {
        const payload = {
            insuranceType: 'TERM_LIFE',
            coverageAmount: 500000,
            applicantAge: 30,
            tobaccoUser: false
        };

        const mockQuote = {
            id: 'quote_123',
            ...payload,
            premiumAmount: 500,
            status: 'COMPLETED',
            createdAt: mockDate,
            updatedAt: mockDate
        };

        vi.mocked(quoteRepository.create).mockResolvedValue(mockQuote);

        const result = await service.generateQuote(payload);

        expect(result.quote).toEqual(mockQuote);
        expect(result.documentJobId).toMatch(/^QDOC-[A-Z0-9_-]+$/);
        expect(result.status).toBe('COMPLETED');

        expect(quoteRepository.create).toHaveBeenCalledWith({
            insuranceType: 'TERM_LIFE',
            coverageAmount: 500000,
            applicantAge: 30,
            tobaccoUser: false,
            premiumAmount: 500, // 500000 * 0.001
            status: 'COMPLETED'
        });
    });

    it('should calculate premium correctly with modifiers (age > 50, tobacco)', async () => {
        const payload = {
            insuranceType: 'TERM_LIFE',
            coverageAmount: 500000,
            applicantAge: 55, // Mod = 1.2
            tobaccoUser: true // Mod = 1.5
        };

        const mockQuote = {
            id: 'quote_123',
            ...payload,
            premiumAmount: 900,
            status: 'COMPLETED',
            createdAt: mockDate,
            updatedAt: mockDate
        };

        vi.mocked(quoteRepository.create).mockResolvedValue(mockQuote);

        await service.generateQuote(payload);

        // base = 500 * 1.5 * 1.2 = 900
        expect(quoteRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            premiumAmount: 900
        }));
    });

    it('should throw ApiError for invalid validation payload', async () => {
        const invalidPayload = {
            insuranceType: 'UNKNOWN',
            coverageAmount: -100
        };

        await expect(service.generateQuote(invalidPayload)).rejects.toThrow('Invalid Quote Data');
        expect(quoteRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ApiError if persistence fails', async () => {
        const payload = {
            insuranceType: 'TERM_LIFE',
            coverageAmount: 500000,
            applicantAge: 30,
            tobaccoUser: false
        };

        vi.mocked(quoteRepository.create).mockRejectedValue(new Error('DB Error'));

        await expect(service.generateQuote(payload)).rejects.toThrow('Failed to persist quote generation');
    });
});
