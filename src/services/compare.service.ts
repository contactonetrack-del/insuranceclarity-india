import { compareRepository } from '@/repositories/compare.repository';

type JsonData = Record<string, string | number | boolean | null | undefined>;

export type ComparePolicy = {
    id: string;
    name: string;
    type: string;
    premium: string;
    cover: string;
    csr: string;
    features: string[];
    pros: string[];
    cons: string[];
    roomRent: string;
    waitingPeriod: string;
    coPayment: string;
    restoration: string;
};

export async function getComparePageData(): Promise<{
    policies: ComparePolicy[];
    categories: Array<{ id: string; name: string }>;
}> {
    const [dbPolicies, dbCategories] = await Promise.all([
        compareRepository.listPoliciesWithType(),
        compareRepository.listInsuranceTypes(),
    ]);

    const policies = dbPolicies.map((p) => {
        const financial = (p.financialData as JsonData) || {};
        const coverage = (p.coverageData as JsonData) || {};
        return {
            id: p.id,
            name: `${p.providerName} ${p.productName}`,
            type: p.type?.name || 'Standard',
            premium: financial.premium ? `INR ${financial.premium}/year` : 'Varies',
            cover: coverage.baseCover ? `INR ${coverage.baseCover}` : 'Varies',
            csr: financial.csr ? `${financial.csr}%` : 'N/A',
            features: Array.isArray(p.benefits) ? p.benefits.slice(0, 3) : ['Standard coverage'],
            pros: Array.isArray(p.benefits) ? p.benefits.slice(0, 3) : ['Good coverage'],
            cons: Array.isArray(p.exclusions) ? p.exclusions.slice(0, 2) : ['Standard exclusions apply'],
            roomRent: String(coverage.roomRentLimit || 'No Limit'),
            waitingPeriod: String(coverage.waitingPeriod || 'None'),
            coPayment: financial.coPay ? `${financial.coPay}%` : 'Zero',
            restoration: String(coverage.restoration || 'Unlimited'),
        };
    });

    const categories = dbCategories.map((c) => ({ id: c.id, name: c.name }));
    return { policies, categories };
}
