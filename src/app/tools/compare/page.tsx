import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import CompareClient, { Policy } from './CompareClient'

export const metadata = {
    title: 'Compare Policies | InsuranceClarity',
    description: 'Compare multiple insurance policies side-by-side to find the right coverage.',
}
export const dynamic = 'force-dynamic'

type JsonData = Record<string, string | number | boolean | null | undefined>

function isExpectedDbFallbackError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error)
    return (
        message.includes('password authentication failed') ||
        message.includes('Raw query failed') ||
        message.includes('P1000') ||
        message.includes('P1001')
    )
}

async function tableExists(tableName: string): Promise<boolean> {
    const qualifiedTableName = `public."${tableName}"`
    const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT to_regclass(${qualifiedTableName}) IS NOT NULL AS "exists"
    `
    return Boolean(rows[0]?.exists)
}

export default async function ComparePage() {
    let policies: Policy[] = []
    let categories: Array<{ id: string; name: string }> = []

    try {
        const [hasPolicyTable, hasTypeTable] = await Promise.all([
            tableExists('InsurancePolicy'),
            tableExists('InsuranceType'),
        ])

        if (hasPolicyTable && hasTypeTable) {
            const [dbPolicies, dbCategories] = await Promise.all([
                prisma.insurancePolicy.findMany({
                    include: { type: true },
                    take: 40,
                }),
                prisma.insuranceType.findMany(),
            ])

            policies = dbPolicies.map((p) => {
                const financial = (p.financialData as JsonData) || {}
                const coverage = (p.coverageData as JsonData) || {}

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
                }
            })

            categories = dbCategories.map((c) => ({ id: c.id, name: c.name }))
        }
    } catch (error) {
        if (isExpectedDbFallbackError(error)) {
            if (process.env.NODE_ENV !== 'production') {
                logger.warn(
                    {
                        action: 'compare.page.db_query_skipped',
                        error: error instanceof Error ? error.message : String(error),
                    },
                    'Skipping compare page DB data; using empty fallback'
                )
            }
            return <CompareClient policies={policies} categories={categories} />
        }

        logger.error(
            {
                action: 'compare.page.db_query_failed',
                error: error instanceof Error ? error.message : String(error),
            },
            'Failed to load policy comparison data; using empty fallback'
        )
    }

    return <CompareClient policies={policies} categories={categories} />
}
