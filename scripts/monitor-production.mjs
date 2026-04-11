#!/usr/bin/env node

import { fetchJson, issueCsrfSession, resolveBaseUrl } from './ops/production-checks.mjs';

const baseUrl = resolveBaseUrl();

async function monitor() {
    let hasCriticalIssue = false;
    console.log('============================================================');
    console.log('PRODUCTION MONITOR');
    console.log('============================================================');
    console.log(`Base URL: ${baseUrl}\n`);

    const homepage = await fetchJson(baseUrl);
    console.log(`Homepage: ${homepage.response.status}`);

    const health = await fetchJson(`${baseUrl}/api/health/plans`);
    console.log(`Health endpoint: ${health.response.status}`);
    if (typeof health.body === 'object' && health.body !== null) {
        console.log(`Health status: ${health.body.status ?? 'unknown'}`);
        console.log(`Plan validation healthy: ${String(health.body.healthy ?? false)}`);
        console.log(`Cache header: ${health.response.headers.get('x-cache-status') ?? 'n/a'}`);
        if (health.body.healthy === false || health.body.status === 'degraded' || health.body.status === 'failed') {
            hasCriticalIssue = true;
        }
    }

    const runtime = await fetchJson(`${baseUrl}/api/health/runtime`);
    console.log(`Runtime dependency health: ${runtime.response.status}`);
    if (runtime.response.status === 404) {
        console.log('Runtime dependency health route is not deployed yet.');
    } else if (typeof runtime.body === 'object' && runtime.body !== null) {
        console.log(`Runtime dependency status: ${runtime.body.status ?? 'unknown'}`);
        if (runtime.body.status === 'degraded' || runtime.body.status === 'failed') {
            hasCriticalIssue = true;
        }
    }

    try {
        const csrf = await issueCsrfSession(baseUrl);
        console.log(`CSRF bootstrap: ok (${csrf.jar.size} cookie(s))`);
    } catch (error) {
        console.log(`CSRF bootstrap: failed (${error instanceof Error ? error.message : String(error)})`);
    }

    console.log('\nRecommended recurring checks:');
    console.log('- Run `npm run verify:deploy` after each production deploy.');
    console.log('- Use `npm run verify:deploy -- --check-payment` only when you intentionally want to create a live unpaid Razorpay order.');
    console.log('- Use `npm run verify:deploy -- --check-sentry` when you want to emit a real Sentry probe event.');
    console.log('- SLO reference: docs/ops/slo-targets.md');
    console.log('- Incident runbook: docs/ops/incident-rollback-runbook.md');

    if (hasCriticalIssue) {
        throw new Error('Critical health check failed against configured SLO expectations.');
    }
}

void monitor().catch((error) => {
    console.error(`Production monitor failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
