import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    findDashboardUserByEmail,
    getUserDashboardCounts,
    listUserCalculations,
    listUserQuotes,
    listUserScans,
} from '../dashboard.service';

const {
    mockFindUserByEmail,
    mockListScansByUserId,
    mockListQuotesByUserId,
    mockListCalculationsByUserId,
    mockGetDashboardCountsByUserId,
} = vi.hoisted(() => ({
    mockFindUserByEmail: vi.fn(),
    mockListScansByUserId: vi.fn(),
    mockListQuotesByUserId: vi.fn(),
    mockListCalculationsByUserId: vi.fn(),
    mockGetDashboardCountsByUserId: vi.fn(),
}));

vi.mock('@/repositories/dashboard.repository', () => ({
    dashboardRepository: {
        findUserByEmail: mockFindUserByEmail,
        listScansByUserId: mockListScansByUserId,
        listQuotesByUserId: mockListQuotesByUserId,
        listCalculationsByUserId: mockListCalculationsByUserId,
        getDashboardCountsByUserId: mockGetDashboardCountsByUserId,
    },
}));

describe('dashboard.service repository delegation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates dashboard read operations to dashboardRepository', async () => {
        mockFindUserByEmail.mockResolvedValue({ id: 'user_1', email: 'demo@example.com' });
        mockListScansByUserId.mockResolvedValue([{ id: 'scan_1' }]);
        mockListQuotesByUserId.mockResolvedValue([{ id: 'quote_1' }]);
        mockListCalculationsByUserId.mockResolvedValue([{ id: 'calc_1' }]);
        mockGetDashboardCountsByUserId.mockResolvedValue({ scanCount: 1, quoteCount: 2, calcCount: 3 });

        const user = await findDashboardUserByEmail('demo@example.com');
        const scans = await listUserScans('user_1');
        const quotes = await listUserQuotes('user_1');
        const calculations = await listUserCalculations('user_1');
        const counts = await getUserDashboardCounts('user_1');

        expect(mockFindUserByEmail).toHaveBeenCalledWith('demo@example.com');
        expect(mockListScansByUserId).toHaveBeenCalledWith('user_1');
        expect(mockListQuotesByUserId).toHaveBeenCalledWith('user_1');
        expect(mockListCalculationsByUserId).toHaveBeenCalledWith('user_1');
        expect(mockGetDashboardCountsByUserId).toHaveBeenCalledWith('user_1');

        expect(user).toEqual({ id: 'user_1', email: 'demo@example.com' });
        expect(scans).toEqual([{ id: 'scan_1' }]);
        expect(quotes).toEqual([{ id: 'quote_1' }]);
        expect(calculations).toEqual([{ id: 'calc_1' }]);
        expect(counts).toEqual({ scanCount: 1, quoteCount: 2, calcCount: 3 });
    });
});
