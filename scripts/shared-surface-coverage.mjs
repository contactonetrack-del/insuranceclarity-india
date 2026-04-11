import fs from 'node:fs';
import path from 'node:path';

const coveragePath = path.resolve('coverage', 'coverage-final.json');

const sharedSurfaceFiles = [
    'src/app/admin/components/AdminJobHealthCard.tsx',
    'src/components/error/ErrorBoundary.tsx',
    'src/components/header/MobileMenuUtilityBar.tsx',
    'src/components/home/HeroSection.tsx',
    'src/components/home/CTASection.tsx',
    'src/components/home/ToolsSection.tsx',
    'src/components/social/ShareButtons.tsx',
    'src/components/ui/LanguageToggle.tsx',
];

const aggregateThresholds = {
    statements: 85,
    branches: 60,
    functions: 85,
};

const perFileStatementFloor = 70;

if (!fs.existsSync(coveragePath)) {
    console.error(`[FAIL] shared-surface-coverage: coverage file not found at ${coveragePath}`);
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

const fileCoverage = sharedSurfaceFiles.map(getFileCoverage);
const missing = fileCoverage.filter((entry) => entry === null).map((entry, index) => sharedSurfaceFiles[index]);

if (missing.length > 0) {
    console.error('[FAIL] shared-surface-coverage: missing files in coverage report');
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

console.log('[shared-surface-coverage]');
console.log(`Statements: ${aggregate.statements.toFixed(2)}%`);
console.log(`Branches: ${aggregate.branches.toFixed(2)}%`);
console.log(`Functions: ${aggregate.functions.toFixed(2)}%`);

if (perFileFailures.length > 0) {
    console.log('\nShared-surface files below per-file statement floor:');
    for (const row of perFileFailures.sort((a, b) => a.statementPct - b.statementPct)) {
        console.log(`- ${row.statementPct.toFixed(1)}% ${row.relPath}`);
    }
}

if (aggregateFailures.length > 0 || perFileFailures.length > 0) {
    console.error('\n[FAIL] shared-surface-coverage gate failed');
    for (const [metric, threshold] of aggregateFailures) {
        console.error(`- ${metric} ${aggregate[metric].toFixed(2)}% < ${threshold}%`);
    }
    process.exit(1);
}

console.log('\n[PASS] shared-surface-coverage gate satisfied');
