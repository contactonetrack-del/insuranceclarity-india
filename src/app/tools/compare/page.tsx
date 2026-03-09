import { prisma } from '@/lib/prisma'
import { InsurancePolicy, InsuranceType } from '@prisma/client'
import CompareClient, { Policy } from './CompareClient'

export const metadata = {
    title: 'Compare Policies | InsuranceClarity',
    description: 'Compare multiple insurance policies side-by-side to find the right coverage.',
}

export default async function ComparePage() {
    // Fetch real policies from the database
    // Join with InsuranceType for categorization
    const dbPolicies = await prisma.insurancePolicy.findMany({
        include: { type: true },
        take: 20 // Reasonable limit for now
    })

    // Map Prisma InsurancePolicy structure into our frontend Policy interface
    const policies: Policy[] = dbPolicies.map((p: InsurancePolicy & { type?: InsuranceType | null }) => {
        const financial = p.financialData as Record<string, any> || {}
        const coverage = p.coverageData as Record<string, any> || {}

        return {
            id: p.id,
            name: `${p.providerName} ${p.productName}`,
            type: p.type?.name || 'Standard',
            premium: financial.premium ? `₹${financial.premium}/year` : 'Varies',
            cover: coverage.baseCover ? `₹${coverage.baseCover}` : 'Varies',
            csr: financial.csr ? `${financial.csr}%` : 'N/A', // e.g. "98.5"
            features: p.benefits?.slice(0, 3) || ['Standard coverage'],
            pros: p.benefits?.slice(0, 3) || ['Good coverage'],
            cons: p.exclusions?.slice(0, 2) || ['Standard exclusions apply']
        }
    })

    // A fallback array if the database is empty but we still want the UI to work
    const displayPolicies = policies.length > 0 ? policies : []

    return <CompareClient policies={displayPolicies} />
}

