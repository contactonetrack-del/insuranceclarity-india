/**
 * Search health-check script — PostgreSQL search + extension readiness
 *
 * Verifies:
 * - the main searchable tables are reachable
 * - `pg_trgm` / `vector` extension state is visible
 * - the application-level search functions execute successfully
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
    findInsuranceProductMatchesInDatabase,
    searchSiteIndexInDatabase,
} from '@/lib/search/database-search';

const prisma = new PrismaClient();

async function checkSearch(): Promise<void> {
    console.log('Checking PostgreSQL search health...\n');

    try {
        const extensions = await prisma.$queryRaw<Array<{ extname: string }>>`
            SELECT extname
            FROM pg_extension
            WHERE extname IN ('pg_trgm', 'vector')
            ORDER BY extname ASC
        `;

        const extensionNames = extensions.map((extension) => extension.extname);
        console.log(`Extensions: ${extensionNames.length > 0 ? extensionNames.join(', ') : '(none installed yet)'}`);

        const [policies, facts, claims] = await Promise.all([
            prisma.insurancePolicy.count(),
            prisma.hiddenFact.count(),
            prisma.claimCase.count(),
        ]);

        const [
            policyEmbeddings,
            factEmbeddings,
            claimEmbeddings,
        ] = await Promise.all([
            prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "InsurancePolicy" WHERE embedding IS NOT NULL`,
            prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "HiddenFact" WHERE embedding IS NOT NULL`,
            prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "ClaimCase" WHERE embedding IS NOT NULL`,
        ]);

        console.log(`InsurancePolicy rows: ${policies}`);
        console.log(`HiddenFact rows: ${facts}`);
        console.log(`ClaimCase rows: ${claims}`);
        console.log(`InsurancePolicy embeddings: ${Number(policyEmbeddings[0]?.count ?? 0n)}`);
        console.log(`HiddenFact embeddings: ${Number(factEmbeddings[0]?.count ?? 0n)}`);
        console.log(`ClaimCase embeddings: ${Number(claimEmbeddings[0]?.count ?? 0n)}`);

        const [productHits, factHits, claimHits] = await Promise.all([
            findInsuranceProductMatchesInDatabase('term life insurance', 3),
            searchSiteIndexInDatabase('hiddenFacts', 'waiting period', 3),
            searchSiteIndexInDatabase('claimCases', 'drunk driving', 3),
        ]);

        console.log(`Product search sample hits: ${productHits.length}`);
        console.log(`HiddenFact search sample hits: ${factHits.length}`);
        console.log(`ClaimCase search sample hits: ${claimHits.length}`);

        console.log('\nSearch health check complete. Backend: postgres');
    } finally {
        await prisma.$disconnect();
    }
}

checkSearch().catch((error: unknown) => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2021'
    ) {
        console.error('Search health check failed: the target database is missing migrated application tables.');
        console.error('Apply the pending Prisma migrations before validating PostgreSQL search readiness.');
        process.exit(1);
    }

    console.error('Search health check failed:', error);
    process.exit(1);
});
