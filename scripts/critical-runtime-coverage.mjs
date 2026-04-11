import fs from 'node:fs';
import path from 'node:path';

const coveragePath = path.resolve('coverage', 'coverage-final.json');

const criticalFiles = [
    'src/app/actions/admin-actions.ts',
    'src/app/api/admin/errors/route.ts',
    'src/app/api/analytics/funnel/route.ts',
    'src/app/api/auth/otp/send/route.ts',
    'src/app/api/calculations/route.ts',
    'src/app/api/claim-cases/route.ts',
    'src/app/api/cron/anomaly-alerts/route.ts',
    'src/app/api/cron/cleanup-stale-scans/route.ts',
    'src/app/api/cron/payment-cleanup/route.ts',
    'src/app/api/cron/payment-reconciliation/route.ts',
    'src/app/api/cron/reset-scans/route.ts',
    'src/app/api/cron/subscription-downgrade/route.ts',
    'src/app/api/health/runtime/route.ts',
    'src/app/api/leads/route.ts',
    'src/app/api/newsletter/route.ts',
    'src/app/api/payment/create-order/route.ts',
    'src/app/api/payment/mark-failed/route.ts',
    'src/app/api/payment/status/route.ts',
    'src/app/api/payment/verify/route.ts',
    'src/app/api/payment/webhook/route.ts',
    'src/app/api/scan/notify/route.ts',
    'src/app/api/search/claims/route.ts',
    'src/app/api/subscription/create/route.ts',
    'src/app/api/subscription/webhook/route.ts',
    'src/app/api/user/calculations/route.ts',
    'src/lib/cache/redis.ts',
    'src/lib/cache/response-cache.ts',
    'src/lib/payments/provider.ts',
    'src/lib/payments/razorpay-provider.ts',
    'src/lib/proxy/access-control.ts',
    'src/lib/proxy/locale.ts',
    'src/lib/proxy/rate-limit-policy.ts',
    'src/lib/proxy/security-headers.ts',
    'src/lib/security/cron-auth.ts',
    'src/lib/security/env.ts',
    'src/lib/security/rbac.ts',
    'src/repositories/payment.repository.ts',
    'src/repositories/subscription.repository.ts',
    'src/services/admin.service.ts',
    'src/services/dashboard.service.ts',
    'src/services/payment.service.ts',
    'src/services/quote.service.ts',
    'src/services/report.service.ts',
    'src/services/subscription.service.ts',
];

const aggregateThresholds = {
    statements: 88,
    branches: 75,
    functions: 90,
};

const perFileStatementFloor = 70;

if (!fs.existsSync(coveragePath)) {
    console.error(`[FAIL] critical-runtime-coverage: coverage file not found at ${coveragePath}`);
    process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

function normalize(filePath) {
    return filePath.replace(/\\/g, '/');
}

function getFileCoverage(relPath) {
    const match = Object.entries(coverage).find(([absPath]) => normalize(absPath).endsWith(relPath));
    if (!match) return null;
    const [, info] = match;

    const statements = Object.values(info.s ?? {});
    const branches = Object.values(info.b ?? {}).flat();
    const functions = Object.values(info.f ?? {});

    const statementCovered = statements.filter((value) => value > 0).length;
    const branchCovered = branches.filter((value) => value > 0).length;
    const functionCovered = functions.filter((value) => value > 0).length;

    return {
        relPath,
        statementTotal: statements.length,
        statementCovered,
        statementPct: statements.length ? (statementCovered / statements.length) * 100 : 100,
        branchTotal: branches.length,
        branchCovered,
        branchPct: branches.length ? (branchCovered / branches.length) * 100 : 100,
        functionTotal: functions.length,
        functionCovered,
        functionPct: functions.length ? (functionCovered / functions.length) * 100 : 100,
    };
}

const fileCoverage = criticalFiles.map(getFileCoverage);
const missing = fileCoverage.filter((entry) => entry === null).map((entry, index) => criticalFiles[index]);

if (missing.length > 0) {
    console.error('[FAIL] critical-runtime-coverage: missing files in coverage report');
    for (const relPath of missing) {
        console.error(`  - ${relPath}`);
    }
    process.exit(1);
}

const rows = fileCoverage;
const totals = rows.reduce(
    (acc, row) => ({
        statementTotal: acc.statementTotal + row.statementTotal,
        statementCovered: acc.statementCovered + row.statementCovered,
        branchTotal: acc.branchTotal + row.branchTotal,
        branchCovered: acc.branchCovered + row.branchCovered,
        functionTotal: acc.functionTotal + row.functionTotal,
        functionCovered: acc.functionCovered + row.functionCovered,
    }),
    {
        statementTotal: 0,
        statementCovered: 0,
        branchTotal: 0,
        branchCovered: 0,
        functionTotal: 0,
        functionCovered: 0,
    },
);

const aggregate = {
    statements: (totals.statementCovered / totals.statementTotal) * 100,
    branches: (totals.branchCovered / totals.branchTotal) * 100,
    functions: (totals.functionCovered / totals.functionTotal) * 100,
};

const perFileFailures = rows.filter((row) => row.statementPct < perFileStatementFloor);
const aggregateFailures = Object.entries(aggregateThresholds).filter(
    ([metric, threshold]) => aggregate[metric] < threshold,
);

console.log('[critical-runtime-coverage]');
console.log(`Statements: ${aggregate.statements.toFixed(2)}%`);
console.log(`Branches: ${aggregate.branches.toFixed(2)}%`);
console.log(`Functions: ${aggregate.functions.toFixed(2)}%`);

if (perFileFailures.length > 0) {
    console.log('\nCritical files below per-file statement floor:');
    for (const row of perFileFailures.sort((a, b) => a.statementPct - b.statementPct)) {
        console.log(`- ${row.statementPct.toFixed(1)}% ${row.relPath}`);
    }
}

if (aggregateFailures.length > 0 || perFileFailures.length > 0) {
    console.error('\n[FAIL] critical-runtime-coverage gate failed');
    for (const [metric, threshold] of aggregateFailures) {
        console.error(`- ${metric} ${aggregate[metric].toFixed(2)}% < ${threshold}%`);
    }
    process.exit(1);
}

console.log('\n[PASS] critical-runtime-coverage gate satisfied');
