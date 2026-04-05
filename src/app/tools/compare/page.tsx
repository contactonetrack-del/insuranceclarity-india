import { prisma } from '@/lib/prisma'
import CompareClient, { Policy } from './CompareClient'

export const metadata = {
    title: 'Compare Policies | InsuranceClarity',
    description: 'Compare multiple insurance policies side-by-side to find the right coverage.',
}

type JsonData = Record<string, string | number | boolean | null | undefined>

export default async function ComparePage() {
    // Fetch real policies from the database
    const [dbPolicies, dbCategories] = await Promise.all([
        prisma.insurancePolicy.findMany({
            include: { type: true },
            take: 40 // More policies for better comparison
        }),
        prisma.insuranceType.findMany()
    ])

    // Map Prisma InsurancePolicy structure into our frontend Policy interface
    const policies: Policy[] = dbPolicies.map((p) => {
        const financial = (p.financialData as JsonData) || {}
        const coverage = (p.coverageData as JsonData) || {}

        return {
            id: p.id,
            name: `${p.providerName} ${p.productName}`,
            type: p.type?.name || 'Standard',
            premium: financial.premium ? `₹${financial.premium}/year` : 'Varies',
            cover: coverage.baseCover ? `₹${coverage.baseCover}` : 'Varies',
            csr: financial.csr ? `${financial.csr}%` : 'N/A',
            features: Array.isArray(p.benefits) ? p.benefits.slice(0, 3) : ['Standard coverage'],
            pros: Array.isArray(p.benefits) ? p.benefits.slice(0, 3) : ['Good coverage'],
            cons: Array.isArray(p.exclusions) ? p.exclusions.slice(0, 2) : ['Standard exclusions apply'],
            roomRent: String(coverage.roomRentLimit || 'No Limit'),
            waitingPeriod: String(coverage.waitingPeriod || 'None'),
            coPayment: financial.coPay ? `${financial.coPay}%` : 'Zero',
            restoration: String(coverage.restoration || 'Unlimited')
        }
    })

    const categories = dbCategories.map(c => ({ id: c.id, name: c.name }))

    return <CompareClient policies={policies} categories={categories} />
}

