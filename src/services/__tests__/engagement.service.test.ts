import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createNewsletterLead,
    createScanNotifyLead,
    findNewsletterLeadByEmail,
    findScanNotifyLead,
} from '../engagement.service';

const {
    mockFindNewsletterByEmail,
    mockCreateNewsletterLead,
    mockFindScanNotifyLead,
    mockCreateScanNotifyLead,
} = vi.hoisted(() => ({
    mockFindNewsletterByEmail: vi.fn(),
    mockCreateNewsletterLead: vi.fn(),
    mockFindScanNotifyLead: vi.fn(),
    mockCreateScanNotifyLead: vi.fn(),
}));

vi.mock('@/repositories/lead.repository', () => ({
    leadRepository: {
        create: vi.fn(),
        findRecent: vi.fn(),
        updateStatus: vi.fn(),
        findNewsletterByEmail: mockFindNewsletterByEmail,
        createNewsletterLead: mockCreateNewsletterLead,
        findScanNotifyLead: mockFindScanNotifyLead,
        createScanNotifyLead: mockCreateScanNotifyLead,
    },
}));

describe('engagement.service repository delegation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates newsletter lead read and write operations to leadRepository', async () => {
        mockFindNewsletterByEmail.mockResolvedValue({ id: 'lead_1' });
        mockCreateNewsletterLead.mockResolvedValue({ id: 'lead_2' });

        await findNewsletterLeadByEmail('newsletter@example.com');
        await createNewsletterLead({
            name: 'Neha',
            email: 'newsletter@example.com',
            source: 'EMAIL',
            notes: 'source:footer',
        });

        expect(mockFindNewsletterByEmail).toHaveBeenCalledWith('newsletter@example.com');
        expect(mockCreateNewsletterLead).toHaveBeenCalledWith({
            name: 'Neha',
            email: 'newsletter@example.com',
            source: 'EMAIL',
            notes: 'source:footer',
        });
    });

    it('delegates scan-notify read and write operations to leadRepository', async () => {
        mockFindScanNotifyLead.mockResolvedValue({ id: 'lead_3' });
        mockCreateScanNotifyLead.mockResolvedValue({ id: 'lead_4' });

        await findScanNotifyLead('notify@example.com', 'scan_123');
        await createScanNotifyLead({
            name: 'Aarav',
            email: 'notify@example.com',
            scanId: 'scan_123',
            locale: 'hi',
        });

        expect(mockFindScanNotifyLead).toHaveBeenCalledWith('notify@example.com', 'scan_123');
        expect(mockCreateScanNotifyLead).toHaveBeenCalledWith({
            name: 'Aarav',
            email: 'notify@example.com',
            scanId: 'scan_123',
            locale: 'hi',
        });
    });
});
