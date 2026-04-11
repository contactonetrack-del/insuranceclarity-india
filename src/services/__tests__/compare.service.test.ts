import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getComparePageData } from '../compare.service';

const {
    mockListPoliciesWithType,
    mockListInsuranceTypes,
} = vi.hoisted(() => ({
    mockListPoliciesWithType: vi.fn(),
    mockListInsuranceTypes: vi.fn(),
}));

vi.mock('@/repositories/compare.repository', () => ({
    compareRepository: {
        listPoliciesWithType: mockListPoliciesWithType,
        listInsuranceTypes: mockListInsuranceTypes,
    },
}));

describe('compare.service repository delegation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates compare reads to compareRepository and maps response shape', async () => {
        mockListPoliciesWithType.mockResolvedValue([
            {
                id: 'policy_1',
                providerName: 'ABC Insurance',
                productName: 'Smart Health',
                type: { name: 'Health' },
                financialData: { premium: 9999, csr: 98, coPay: 10 },
                coverageData: {
                    baseCover: 500000,
                    roomRentLimit: 'Single Private Room',
                    waitingPeriod: '2 Years',
                    restoration: 'Yes',
                },
                benefits: ['Cashless hospitals', 'No claim bonus', 'Daycare'],
                exclusions: ['Cosmetic surgery'],
            },
        ]);
        mockListInsuranceTypes.mockResolvedValue([
            { id: 'type_1', name: 'Health' },
            { id: 'type_2', name: 'Life' },
        ]);

        const result = await getComparePageData();

        expect(mockListPoliciesWithType).toHaveBeenCalledTimes(1);
        expect(mockListInsuranceTypes).toHaveBeenCalledTimes(1);
        expect(result.categories).toEqual([
            { id: 'type_1', name: 'Health' },
            { id: 'type_2', name: 'Life' },
        ]);
        expect(result.policies).toEqual([
            {
                id: 'policy_1',
                name: 'ABC Insurance Smart Health',
                type: 'Health',
                premium: 'INR 9999/year',
                cover: 'INR 500000',
                csr: '98%',
                features: ['Cashless hospitals', 'No claim bonus', 'Daycare'],
                pros: ['Cashless hospitals', 'No claim bonus', 'Daycare'],
                cons: ['Cosmetic surgery'],
                roomRent: 'Single Private Room',
                waitingPeriod: '2 Years',
                coPayment: '10%',
                restoration: 'Yes',
            },
        ]);
    });
});
