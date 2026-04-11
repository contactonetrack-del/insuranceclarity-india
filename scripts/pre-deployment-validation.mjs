#!/usr/bin/env node

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
    'src/auth.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/api/payment/create-order/route.ts',
    'src/app/api/payment/verify/route.ts',
    'src/app/api/upload/route.ts',
    'src/lib/storage/document-store.ts',
    'scripts/security/preflight-env.mjs',
    'scripts/post-deployment-verification.mjs',
    'scripts/monitor-production.mjs',
];

function runCommand(command, label, { optional = false } = {}) {
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`PASS ${label}`);
        return true;
    } catch (error) {
        if (optional) {
            console.log(`WARN ${label}`);
            return false;
        }

        console.log(`FAIL ${label}`);
        throw error;
    }
}

function verifyFiles() {
    let missing = 0;
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            console.log(`PASS required file: ${file}`);
            continue;
        }

        missing += 1;
        console.log(`FAIL required file missing: ${file}`);
    }

    if (missing > 0) {
        throw new Error(`Missing ${missing} required file(s).`);
    }
}

function verifyMigrations() {
    const migrationsDir = 'prisma/migrations';
    if (!fs.existsSync(migrationsDir)) {
        throw new Error('prisma/migrations is missing.');
    }

    const migrations = fs.readdirSync(migrationsDir).filter((entry) => !entry.startsWith('.'));
    if (migrations.length === 0) {
        throw new Error('No Prisma migrations found.');
    }

    console.log(`PASS migrations present (${migrations.length})`);
}

function main() {
    const skipBuild = process.argv.includes('--skip-build');

    console.log('============================================================');
    console.log('PRE-DEPLOYMENT VALIDATION');
    console.log('============================================================');

    verifyFiles();
    verifyMigrations();
    runCommand('npm run security:preflight', 'security preflight');
    runCommand('npm run typecheck', 'typecheck');
    runCommand('npm run lint -- --max-warnings 0', 'lint');
    runCommand('npm test -- --run', 'unit tests');
    runCommand('npm run db:rollout:status', 'database rollout status', { optional: true });

    if (!skipBuild) {
        runCommand('npm run build', 'production build');
    } else {
        console.log('WARN build skipped (--skip-build)');
    }

    console.log('\nDeployment validation complete.');
}

try {
    main();
} catch (error) {
    console.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}
