import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuoteRepository } from './quote.repository';

const {
    mockCount,
    mockFindMany,
    mockFindUnique,
    mockCreate,
    mockUpdate,
    mockLogDbQuery,
    mockError,
} = vi.hoisted(() => ({
    mockCount: vi.fn(),
    mockFindMany: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockLogDbQuery: vi.fn(),
    mockError: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        quote: {
            count: mockCount,
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            create: mockCreate,
            update: mockUpdate,
        },
    },
}));

vi.mock('@/lib/logger', () => ({
    logDbQuery: mockLogDbQuery,
    logger: {
        error: mockError,
    },
}));

describe('QuoteRepository', () => {
    const repository = new QuoteRepository();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('counts quotes', async () => {
        mockCount.mockResolvedValue(4);
        await expect(repository.countAll()).resolves.toBe(4);
        expect(mockCount).toHaveBeenCalled();
    });

    it('lists recent quotes', async () => {
        mockFindMany.mockResolvedValue([{ id: 'quote_1' }]);
        await expect(repository.findAll()).resolves.toEqual([{ id: 'quote_1' }]);
        expect(mockFindMany).toHaveBeenCalledWith({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    });

    it('looks up a quote by id', async () => {
        mockFindUnique.mockResolvedValue({ id: 'quote_1' });
        await expect(repository.findById('quote_1')).resolves.toEqual({ id: 'quote_1' });
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'quote_1' } });
    });

    it('creates a quote', async () => {
        const data = { premiumAmount: 500 };
        mockCreate.mockResolvedValue({ id: 'quote_1' });
        await expect(repository.create(data as never)).resolves.toEqual({ id: 'quote_1' });
        expect(mockCreate).toHaveBeenCalledWith({ data });
    });

    it('updates a quote', async () => {
        const data = { status: 'READY' };
        mockUpdate.mockResolvedValue({ id: 'quote_1', status: 'READY' });
        await expect(repository.update('quote_1', data as never)).resolves.toEqual({ id: 'quote_1', status: 'READY' });
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'quote_1' },
            data,
        });
    });

    it('logs and rethrows repository failures', async () => {
        const error = new Error('db failed');
        mockFindUnique.mockRejectedValue(error);

        await expect(repository.findById('quote_1')).rejects.toThrow('db failed');
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'findById', model: 'Quote', id: 'quote_1' }),
            'Repository Error: Quote.findById',
        );
    });
});
