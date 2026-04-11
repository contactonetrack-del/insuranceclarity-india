import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadRepository } from './lead.repository';

const {
    mockFindMany,
    mockUpdate,
    mockCreate,
    mockFindFirst,
    mockLogDbQuery,
    mockError,
} = vi.hoisted(() => ({
    mockFindMany: vi.fn(),
    mockUpdate: vi.fn(),
    mockCreate: vi.fn(),
    mockFindFirst: vi.fn(),
    mockLogDbQuery: vi.fn(),
    mockError: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        lead: {
            findMany: mockFindMany,
            update: mockUpdate,
            create: mockCreate,
            findFirst: mockFindFirst,
        },
    },
}));

vi.mock('@/lib/logger', () => ({
    logDbQuery: mockLogDbQuery,
    logger: {
        error: mockError,
    },
}));

describe('LeadRepository', () => {
    const repository = new LeadRepository();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('finds recent leads', async () => {
        mockFindMany.mockResolvedValue([{ id: 'lead_1' }]);
        await expect(repository.findRecent(25)).resolves.toEqual([{ id: 'lead_1' }]);
        expect(mockFindMany).toHaveBeenCalledWith({
            orderBy: { createdAt: 'desc' },
            take: 25,
        });
    });

    it('updates lead status', async () => {
        mockUpdate.mockResolvedValue({ id: 'lead_1', status: 'CONTACTED' });
        await expect(repository.updateStatus('lead_1', 'CONTACTED')).resolves.toEqual({ id: 'lead_1', status: 'CONTACTED' });
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'lead_1' },
            data: { status: 'CONTACTED' },
        });
    });

    it('creates generic and newsletter leads', async () => {
        mockCreate.mockResolvedValue({ id: 'lead_1' });

        await expect(repository.create({ email: 'demo@example.com' } as never)).resolves.toEqual({ id: 'lead_1' });
        await expect(
            repository.createNewsletterLead({
                name: 'Demo User',
                email: 'demo@example.com',
                source: 'EMAIL',
                notes: 'newsletter',
            }),
        ).resolves.toEqual({ id: 'lead_1' });

        expect(mockCreate).toHaveBeenNthCalledWith(1, { data: { email: 'demo@example.com' } });
        expect(mockCreate).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                data: expect.objectContaining({
                    insuranceType: 'NEWSLETTER',
                    status: 'NEW',
                }),
            }),
        );
    });

    it('looks up newsletter and scan notify leads', async () => {
        mockFindFirst.mockResolvedValueOnce({ id: 'lead_newsletter' }).mockResolvedValueOnce({ id: 'lead_scan_notify' });

        await expect(repository.findNewsletterByEmail('demo@example.com')).resolves.toEqual({ id: 'lead_newsletter' });
        await expect(repository.findScanNotifyLead('demo@example.com', 'scan_1')).resolves.toEqual({ id: 'lead_scan_notify' });

        expect(mockFindFirst).toHaveBeenNthCalledWith(
            1,
            { where: { email: 'demo@example.com', insuranceType: 'NEWSLETTER' } },
        );
        expect(mockFindFirst).toHaveBeenNthCalledWith(
            2,
            {
                where: {
                    email: 'demo@example.com',
                    insuranceType: 'SCAN_NOTIFY',
                    notes: { startsWith: 'scan:scan_1' },
                },
                select: { id: true },
            },
        );
    });

    it('creates scan notify leads with locale-scoped notes', async () => {
        mockCreate.mockResolvedValue({ id: 'lead_scan_notify' });

        await expect(
            repository.createScanNotifyLead({
                name: 'Demo User',
                email: 'demo@example.com',
                scanId: 'scan_1',
                locale: 'hi',
            }),
        ).resolves.toEqual({ id: 'lead_scan_notify' });

        expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    insuranceType: 'SCAN_NOTIFY',
                    notes: 'scan:scan_1 | locale:hi',
                }),
            }),
        );
    });

    it('logs and rethrows repository failures', async () => {
        const error = new Error('db failed');
        mockUpdate.mockRejectedValue(error);

        await expect(repository.updateStatus('lead_1', 'NEW')).rejects.toThrow('db failed');
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'updateStatus', model: 'Lead', id: 'lead_1', status: 'NEW' }),
            'Repository Error: Lead.updateStatus',
        );
    });
});
