#!/usr/bin/env node

import {
    createPaymentOrder,
    fetchJson,
    fetchReport,
    issueCsrfSession,
    pollScanStatus,
    resolveBaseUrl,
    sendSentryProbe,
    uploadSamplePdf,
} from './ops/production-checks.mjs';

const COLORS = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
};

class DeploymentVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
        };
        this.issues = [];
        this.baseUrl = resolveBaseUrl();
        this.csrf = null;
        this.uploadResult = null;
    }

    log(message, color = COLORS.blue, icon = 'i') {
        console.log(`${color}${icon} ${message}${COLORS.reset}`);
    }

    pass(message) {
        this.results.passed += 1;
        this.log(message, COLORS.green, 'PASS');
    }

    warn(message) {
        this.results.warnings += 1;
        this.log(message, COLORS.yellow, 'WARN');
    }

    fail(message) {
        this.results.failed += 1;
        this.issues.push(message);
        this.log(message, COLORS.red, 'FAIL');
    }

    async checkHomepage() {
        const { response } = await fetchJson(this.baseUrl);
        if (response.ok) {
            this.pass(`Homepage reachable at ${this.baseUrl} (${response.status})`);
            return;
        }

        this.fail(`Homepage check failed with ${response.status}`);
    }

    async checkHealthEndpoint() {
        const { response, body } = await fetchJson(`${this.baseUrl}/api/health/plans`);
        if (response.status === 200 && body?.healthy === true) {
            this.pass(`Health endpoint is healthy (${response.status})`);
            return;
        }

        this.fail(`Health endpoint degraded (${response.status}): ${JSON.stringify(body)}`);
    }

    async checkRuntimeDependencies() {
        const { response, body } = await fetchJson(`${this.baseUrl}/api/health/runtime`);

        if (response.status === 404) {
            this.warn('Runtime dependency health endpoint is not deployed yet. Redeploy to enable DB/queue dependency checks.');
            return;
        }

        if (response.status === 200 && body?.healthy === true) {
            this.pass('Runtime dependency health endpoint reports healthy dependencies.');
            return;
        }

        this.fail(`Runtime dependency health degraded (${response.status}): ${JSON.stringify(body)}`);
    }

    async checkCsrfBootstrap() {
        this.csrf = await issueCsrfSession(this.baseUrl);
        if (this.csrf.csrfToken && this.csrf.jar.size > 0) {
            this.pass('CSRF bootstrap returned a token and cookie.');
            return;
        }

        this.fail('CSRF bootstrap did not establish a valid session.');
    }

    async checkUploadAndResultFlow() {
        if (!this.csrf) {
            throw new Error('CSRF session was not initialized.');
        }

        this.uploadResult = await uploadSamplePdf(this.baseUrl, {
            jar: this.csrf.jar,
            csrfToken: this.csrf.csrfToken,
        });
        this.pass(`Upload flow created scan ${this.uploadResult.scanId}`);

        const statusPayload = await pollScanStatus(this.baseUrl, {
            jar: this.csrf.jar,
            scanId: this.uploadResult.scanId,
            claimToken: this.uploadResult.claimToken,
        });
        this.pass(`Scan processing completed with status ${statusPayload.status}`);

        const reportPayload = await fetchReport(this.baseUrl, {
            jar: this.csrf.jar,
            scanId: this.uploadResult.scanId,
            claimToken: this.uploadResult.claimToken,
        });

        if (reportPayload?.scanId === this.uploadResult.scanId && typeof reportPayload?.summary === 'string') {
            this.pass('Result endpoint returned a report payload.');
            return;
        }

        this.fail(`Result payload shape was unexpected: ${JSON.stringify(reportPayload)}`);
    }

    async checkPaymentOrder() {
        const shouldCreatePaymentOrder =
            process.argv.includes('--check-payment') ||
            process.env.VERIFY_DEPLOY_PAYMENT_ORDER === 'true';

        if (!shouldCreatePaymentOrder) {
            this.warn('Skipped live payment order creation. Use --check-payment to exercise the Razorpay order path.');
            return;
        }

        if (!this.csrf || !this.uploadResult) {
            throw new Error('Payment check requires a completed upload flow first.');
        }

        const order = await createPaymentOrder(this.baseUrl, {
            jar: this.csrf.jar,
            csrfToken: this.csrf.csrfToken,
            scanId: this.uploadResult.scanId,
            claimToken: this.uploadResult.claimToken,
        });

        this.pass(`Payment order created successfully (${order.orderId})`);
    }

    async checkSentryProbe() {
        const shouldSendSentryProbe =
            process.argv.includes('--check-sentry') ||
            process.env.VERIFY_DEPLOY_SENTRY_PROBE === 'true';

        if (!shouldSendSentryProbe) {
            this.warn('Skipped Sentry probe. Use --check-sentry to emit a deployment verification event.');
            return;
        }

        const probe = await sendSentryProbe({ baseUrl: this.baseUrl });
        if (probe.skipped) {
            this.warn(`Skipped Sentry probe: ${probe.reason}`);
            return;
        }

        this.pass(`Sentry accepted probe event ${probe.eventId}`);
    }

    printSummary() {
        console.log('\n============================================================');
        console.log('POST-DEPLOYMENT VERIFICATION SUMMARY');
        console.log('============================================================');
        console.log(`Passed:   ${this.results.passed}`);
        console.log(`Warnings: ${this.results.warnings}`);
        console.log(`Failed:   ${this.results.failed}`);

        if (this.issues.length > 0) {
            console.log('\nIssues:');
            for (const issue of this.issues) {
                console.log(`- ${issue}`);
            }
        }

        if (this.results.failed > 0) {
            process.exit(1);
        }
    }

    async run() {
        console.log('============================================================');
        console.log('POST-DEPLOYMENT VERIFICATION');
        console.log('============================================================');
        console.log(`Base URL: ${this.baseUrl}\n`);

        await this.checkHomepage();
        await this.checkHealthEndpoint();
        await this.checkRuntimeDependencies();
        await this.checkCsrfBootstrap();
        await this.checkUploadAndResultFlow();
        await this.checkPaymentOrder();
        await this.checkSentryProbe();
        this.printSummary();
    }
}

const verifier = new DeploymentVerifier();
verifier.run().catch((error) => {
    console.error(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
