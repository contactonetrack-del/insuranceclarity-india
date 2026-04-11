import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '../services/embedding.service';

type BackfillScope = 'all' | 'policies' | 'facts' | 'claims';
type TableName = 'InsurancePolicy' | 'HiddenFact' | 'ClaimCase';

interface ScriptOptions {
    force: boolean;
    limit: number | null;
    scope: BackfillScope;
}

const prisma = new PrismaClient();

function parseOptions(argv: string[]): ScriptOptions {
    let force = false;
    let limit: number | null = null;
    let scope: BackfillScope = 'all';

    for (const arg of argv) {
        if (arg === '--force') {
            force = true;
            continue;
        }

        if (arg.startsWith('--limit=')) {
            const parsed = Number.parseInt(arg.slice('--limit='.length), 10);
            if (Number.isFinite(parsed) && parsed > 0) {
                limit = parsed;
            }
            continue;
        }

        if (arg.startsWith('--scope=')) {
            const parsed = arg.slice('--scope='.length).trim().toLowerCase();
            if (parsed === 'all' || parsed === 'policies' || parsed === 'facts' || parsed === 'claims') {
                scope = parsed;
            }
        }
    }

    return { force, limit, scope };
}

function toVectorLiteral(vector: number[]): string {
    return `[${vector.map((value) => {
        if (!Number.isFinite(value)) {
            return '0';
        }

        return Number(value).toFixed(8);
    }).join(',')}]`;
}

async function updateEmbedding(tableName: TableName, id: string, vector: number[]): Promise<void> {
    const vectorLiteral = toVectorLiteral(vector);
    await prisma.$executeRawUnsafe(
        `UPDATE "${tableName}" SET "embedding" = $1::vector WHERE id = $2`,
        vectorLiteral,
        id,
    );
}

async function getTargetIds(tableName: TableName, options: ScriptOptions): Promise<string[]> {
    const limitClause = options.limit ? ` LIMIT ${options.limit}` : '';
    const query = options.force
        ? `SELECT id FROM "${tableName}" ORDER BY "createdAt" ASC${limitClause}`
        : `SELECT id FROM "${tableName}" WHERE embedding IS NULL ORDER BY "createdAt" ASC${limitClause}`;

    const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(query);
    return rows.map((row) => row.id);
}

function buildPolicyText(policy: {
    providerName: string;
    productName: string;
    seoSlug: string;
    benefits: string[];
    exclusions: string[];
    coverageData: unknown;
    eligibilityData: unknown;
    financialData: unknown;
    type: {
        name: string;
        subcategory: {
            name: string;
            category: {
                name: string;
            };
        };
    };
}): string {
    return [
        `Provider: ${policy.providerName}`,
        `Product: ${policy.productName}`,
        `Slug: ${policy.seoSlug}`,
        `Type: ${policy.type.name}`,
        `Subcategory: ${policy.type.subcategory.name}`,
        `Category: ${policy.type.subcategory.category.name}`,
        `Benefits: ${policy.benefits.join(', ')}`,
        `Exclusions: ${policy.exclusions.join(', ')}`,
        `Coverage: ${JSON.stringify(policy.coverageData)}`,
        `Eligibility: ${JSON.stringify(policy.eligibilityData)}`,
        `Financials: ${JSON.stringify(policy.financialData)}`,
    ].join('. ');
}

function buildHiddenFactText(fact: {
    category: string;
    title: string;
    severity: string;
    description: string;
    affectedPolicies: string[];
    whatToCheck: string;
    realCase: string;
    example: string | null;
}): string {
    return [
        `Category: ${fact.category}`,
        `Title: ${fact.title}`,
        `Severity: ${fact.severity}`,
        `Description: ${fact.description}`,
        `Affected policies: ${fact.affectedPolicies.join(', ')}`,
        `What to check: ${fact.whatToCheck}`,
        `Real case: ${fact.realCase}`,
        fact.example ? `Example: ${fact.example}` : '',
    ].filter(Boolean).join('. ');
}

function buildClaimCaseText(claim: {
    category: string;
    title: string;
    status: string;
    amount: number;
    issue: string;
    details: string;
    outcome: string;
    lesson: string;
}): string {
    return [
        `Category: ${claim.category}`,
        `Title: ${claim.title}`,
        `Status: ${claim.status}`,
        `Amount: ${claim.amount}`,
        `Issue: ${claim.issue}`,
        `Details: ${claim.details}`,
        `Outcome: ${claim.outcome}`,
        `Lesson: ${claim.lesson}`,
    ].join('. ');
}

async function backfillPolicies(options: ScriptOptions): Promise<number> {
    const ids = await getTargetIds('InsurancePolicy', options);
    if (ids.length === 0) {
        console.log('InsurancePolicy: nothing to backfill.');
        return 0;
    }

    const policies = await prisma.insurancePolicy.findMany({
        where: { id: { in: ids } },
        include: {
            type: {
                include: {
                    subcategory: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    let processed = 0;
    for (const policy of policies) {
        const vector = await generateEmbedding(buildPolicyText(policy));
        await updateEmbedding('InsurancePolicy', policy.id, vector);
        processed += 1;
        console.log(`InsurancePolicy: ${processed}/${policies.length} -> ${policy.seoSlug}`);
    }

    return processed;
}

async function backfillHiddenFacts(options: ScriptOptions): Promise<number> {
    const ids = await getTargetIds('HiddenFact', options);
    if (ids.length === 0) {
        console.log('HiddenFact: nothing to backfill.');
        return 0;
    }

    const facts = await prisma.hiddenFact.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: 'asc' },
    });

    let processed = 0;
    for (const fact of facts) {
        const vector = await generateEmbedding(buildHiddenFactText(fact));
        await updateEmbedding('HiddenFact', fact.id, vector);
        processed += 1;
        console.log(`HiddenFact: ${processed}/${facts.length} -> ${fact.title}`);
    }

    return processed;
}

async function backfillClaimCases(options: ScriptOptions): Promise<number> {
    const ids = await getTargetIds('ClaimCase', options);
    if (ids.length === 0) {
        console.log('ClaimCase: nothing to backfill.');
        return 0;
    }

    const claims = await prisma.claimCase.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: 'asc' },
    });

    let processed = 0;
    for (const claim of claims) {
        const vector = await generateEmbedding(buildClaimCaseText(claim));
        await updateEmbedding('ClaimCase', claim.id, vector);
        processed += 1;
        console.log(`ClaimCase: ${processed}/${claims.length} -> ${claim.title}`);
    }

    return processed;
}

async function main(): Promise<void> {
    const options = parseOptions(process.argv.slice(2));
    const totals = {
        policies: 0,
        facts: 0,
        claims: 0,
    };

    console.log(`Embedding backfill started. Scope=${options.scope} force=${String(options.force)} limit=${options.limit ?? 'all'}`);

    if (options.scope === 'all' || options.scope === 'policies') {
        totals.policies = await backfillPolicies(options);
    }

    if (options.scope === 'all' || options.scope === 'facts') {
        totals.facts = await backfillHiddenFacts(options);
    }

    if (options.scope === 'all' || options.scope === 'claims') {
        totals.claims = await backfillClaimCases(options);
    }

    console.log(`Embedding backfill complete. policies=${totals.policies} facts=${totals.facts} claims=${totals.claims}`);
}

void main()
    .catch((error: unknown) => {
        console.error('Embedding backfill failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
