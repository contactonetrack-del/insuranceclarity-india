import { createHmac } from 'crypto';
import { expect, test, type APIRequestContext } from '@playwright/test';

const E2E_TEST_SECRET = process.env.E2E_TEST_SECRET;
const WEBHOOK_SIGNING_SECRET = 'test_secret_for_local_e2e';

interface PaymentFixture {
    scanId: string;
    claimToken: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    scenario: 'created' | 'captured' | 'failed';
}

function fixtureHeaders() {
    return {
        'x-e2e-test-secret': E2E_TEST_SECRET ?? '',
    };
}

function signWebhookPayload(payload: string): string {
    return createHmac('sha256', WEBHOOK_SIGNING_SECRET).update(payload).digest('hex');
}

async function createPaymentFixture(
    request: APIRequestContext,
    scenario: 'created' | 'captured' | 'failed' = 'created',
): Promise<PaymentFixture> {
    const response = await request.post('/api/test-utils/payment-fixture', {
        headers: fixtureHeaders(),
        data: { scenario },
    });

    expect(response.status()).toBe(200);
    return response.json() as Promise<PaymentFixture>;
}

async function deletePaymentFixture(request: APIRequestContext, scanId: string): Promise<void> {
    try {
        await request.delete('/api/test-utils/payment-fixture', {
            headers: fixtureHeaders(),
            data: { scanId },
        });
    } catch {
        // Cleanup should not fail the test run.
    }
}

test.describe('Payment Lifecycle (Critical)', () => {
    test('handles webhook failed/captured transitions and unlocks report idempotently', async ({ request }) => {
        test.setTimeout(180000);
        test.skip(!E2E_TEST_SECRET, 'E2E_TEST_SECRET is required for deterministic payment lifecycle tests.');
        const fixture = await createPaymentFixture(request, 'created');
        const accessHeaders = { 'X-Claim-Token': fixture.claimToken };

        try {
            const reportBefore = await request.get(`/api/result/${fixture.scanId}`, { headers: accessHeaders });
            expect(reportBefore.status()).toBe(200);
            const reportBeforeJson = await reportBefore.json() as { paywall?: boolean; isPaid?: boolean };
            expect(reportBeforeJson.paywall).toBe(true);
            expect(reportBeforeJson.isPaid).toBe(false);

            const statusBefore = await request.get(`/api/payment/status?scanId=${fixture.scanId}`, {
                headers: accessHeaders,
            });
            expect(statusBefore.status()).toBe(200);
            const statusBeforeJson = await statusBefore.json() as { status?: string; canRetry?: boolean };
            expect(statusBeforeJson.status).toBe('CREATED');
            expect(statusBeforeJson.canRetry).toBe(true);

            const failedPayload = JSON.stringify({
                event: 'payment.failed',
                payload: {
                    payment: {
                        entity: {
                            id: `${fixture.razorpayPaymentId}_failed`,
                            order_id: fixture.razorpayOrderId,
                            status: 'failed',
                        },
                    },
                },
            });
            const failedWebhook = await request.post('/api/payment/webhook', {
                data: failedPayload,
                headers: {
                    'Content-Type': 'application/json',
                    'x-razorpay-signature': signWebhookPayload(failedPayload),
                    'x-razorpay-event-id': `evt_failed_${fixture.scanId}`,
                },
            });
            expect(failedWebhook.status()).toBe(200);

            const statusAfterFailure = await request.get(`/api/payment/status?scanId=${fixture.scanId}`, {
                headers: accessHeaders,
            });
            expect(statusAfterFailure.status()).toBe(200);
            const statusAfterFailureJson = await statusAfterFailure.json() as { status?: string };
            expect(statusAfterFailureJson.status).toBe('FAILED');

            const capturedPayload = JSON.stringify({
                event: 'payment.captured',
                payload: {
                    payment: {
                        entity: {
                            id: fixture.razorpayPaymentId,
                            order_id: fixture.razorpayOrderId,
                            status: 'captured',
                        },
                    },
                },
            });
            const captureEventId = `evt_capture_${fixture.scanId}`;
            const capturedWebhook = await request.post('/api/payment/webhook', {
                data: capturedPayload,
                headers: {
                    'Content-Type': 'application/json',
                    'x-razorpay-signature': signWebhookPayload(capturedPayload),
                    'x-razorpay-event-id': captureEventId,
                },
            });
            expect(capturedWebhook.status()).toBe(200);

            const duplicateWebhook = await request.post('/api/payment/webhook', {
                data: capturedPayload,
                headers: {
                    'Content-Type': 'application/json',
                    'x-razorpay-signature': signWebhookPayload(capturedPayload),
                    'x-razorpay-event-id': captureEventId,
                },
            });
            expect(duplicateWebhook.status()).toBe(200);
            const duplicateJson = await duplicateWebhook.json() as { status?: string };
            expect(duplicateJson.status === undefined || duplicateJson.status === 'duplicate').toBe(true);

            const statusAfterCapture = await request.get(`/api/payment/status?scanId=${fixture.scanId}`, {
                headers: accessHeaders,
            });
            expect(statusAfterCapture.status()).toBe(200);
            const statusAfterCaptureJson = await statusAfterCapture.json() as { status?: string; canRetry?: boolean };
            expect(statusAfterCaptureJson.status).toBe('CAPTURED');
            expect(statusAfterCaptureJson.canRetry).toBe(false);

            const reportAfter = await request.get(`/api/result/${fixture.scanId}`, { headers: accessHeaders });
            expect(reportAfter.status()).toBe(200);
            const reportAfterJson = await reportAfter.json() as { paywall?: boolean; isPaid?: boolean };
            expect(reportAfterJson.paywall).toBe(false);
            expect(reportAfterJson.isPaid).toBe(true);
        } finally {
            await deletePaymentFixture(request, fixture.scanId);
        }
    });

    test('rejects invalid webhook signatures', async ({ request }) => {
        const payload = JSON.stringify({
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_invalid_signature_case',
                        order_id: 'order_invalid_signature_case',
                        status: 'captured',
                    },
                },
            },
        });

        const response = await request.post('/api/payment/webhook', {
            data: payload,
            headers: {
                'Content-Type': 'application/json',
                'x-razorpay-signature': '0'.repeat(64),
            },
        });

        expect(response.status()).toBe(400);
    });

    test('keeps payment state stable across delayed webhook retry delivery', async ({ request }) => {
        test.setTimeout(90000);
        test.skip(!E2E_TEST_SECRET, 'E2E_TEST_SECRET is required for deterministic payment lifecycle tests.');
        const fixture = await createPaymentFixture(request, 'created');
        const accessHeaders = { 'X-Claim-Token': fixture.claimToken };

        try {
            const capturedPayload = JSON.stringify({
                event: 'payment.captured',
                payload: {
                    payment: {
                        entity: {
                            id: fixture.razorpayPaymentId,
                            order_id: fixture.razorpayOrderId,
                            status: 'captured',
                        },
                    },
                },
            });

            const firstWebhook = await request.post('/api/payment/webhook', {
                data: capturedPayload,
                headers: {
                    'Content-Type': 'application/json',
                    'x-razorpay-signature': signWebhookPayload(capturedPayload),
                    'x-razorpay-event-id': `evt_delayed_a_${fixture.scanId}`,
                },
            });
            expect(firstWebhook.status()).toBe(200);

            await test.step('simulate delayed provider retry', async () => {
                await new Promise<void>((resolve) => setTimeout(resolve, 1200));
            });

            const delayedRetryWebhook = await request.post('/api/payment/webhook', {
                data: capturedPayload,
                headers: {
                    'Content-Type': 'application/json',
                    'x-razorpay-signature': signWebhookPayload(capturedPayload),
                    'x-razorpay-event-id': `evt_delayed_b_${fixture.scanId}`,
                },
            });
            expect(delayedRetryWebhook.status()).toBe(200);

            const statusAfterDelay = await request.get(`/api/payment/status?scanId=${fixture.scanId}`, {
                headers: accessHeaders,
            });
            expect(statusAfterDelay.status()).toBe(200);
            const statusPayload = await statusAfterDelay.json() as { status?: string; canRetry?: boolean };
            expect(statusPayload.status).toBe('CAPTURED');
            expect(statusPayload.canRetry).toBe(false);
        } finally {
            await deletePaymentFixture(request, fixture.scanId);
        }
    });
});

test.describe('Paywall UI Checkout Path', () => {
    test('submits create-order and verify calls, then renders unlocked state', async ({ page }) => {
        const scanId = 'c1234567890abcdef1234567';
        let unlocked = false;
        let createOrderCalled = false;
        let verifyCalled = false;
        let csrfForwardedToCreateOrder = false;
        let csrfForwardedToVerify = false;

        await page.addInitScript((id) => {
            window.sessionStorage.setItem(`scan_claim_${id}`, 'claim_token_ui_fixture');
        }, scanId);

        await page.route('https://checkout.razorpay.com/v1/checkout.js', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: `
                    window.Razorpay = function(options) {
                        this.on = function() {};
                        this.open = function() {
                            setTimeout(function () {
                                options.handler({
                                    razorpay_order_id: options.order_id,
                                    razorpay_payment_id: 'pay_ui_fixture',
                                    razorpay_signature: 'sig_ui_fixture'
                                });
                            }, 0);
                        };
                    };
                `,
            });
        });

        await page.route('**/api/csrf', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: {
                    'set-cookie': '__csrf=csrf_ui_fixture; Path=/; SameSite=Strict',
                },
                body: JSON.stringify({ csrfToken: 'csrf_ui_fixture' }),
            });
        });

        await page.route(`**/api/payment/status?scanId=${scanId}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    scanId,
                    status: unlocked ? 'CAPTURED' : 'NOT_CREATED',
                    canRetry: !unlocked,
                    message: unlocked
                        ? 'Payment captured. Your report is unlocked.'
                        : 'No payment attempt found yet.',
                    updatedAt: null,
                }),
            });
        });

        await page.route(`**/api/result/${scanId}`, async (route) => {
            if (!unlocked) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        scanId,
                        score: 61,
                        summary: 'Fixture free summary.',
                        risks: [
                            { title: 'Risk A', severity: 'HIGH' },
                            { title: 'Risk B', severity: 'HIGH' },
                            { title: 'Risk C', severity: 'MEDIUM' },
                        ],
                        isPaid: false,
                        paywall: true,
                        paywallMessage: 'Unlock full report for fixture flow.',
                        exclusionsCount: 2,
                        suggestionsCount: 2,
                        hiddenClausesCount: 2,
                    }),
                });
                return;
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    scanId,
                    score: 61,
                    summary: 'Fixture full summary.',
                    risks: [
                        { title: 'Risk A', severity: 'HIGH' },
                        { title: 'Risk B', severity: 'HIGH' },
                        { title: 'Risk C', severity: 'MEDIUM' },
                    ],
                    exclusions: ['Exclusion A', 'Exclusion B'],
                    suggestions: ['Suggestion A', 'Suggestion B'],
                    hiddenClauses: ['Hidden A', 'Hidden B'],
                    isPaid: true,
                    paywall: false,
                }),
            });
        });

        await page.route('**/api/payment/create-order', async (route) => {
            createOrderCalled = true;
            csrfForwardedToCreateOrder = route.request().headers()['x-csrf-token'] === 'csrf_ui_fixture';
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    orderId: 'order_ui_fixture',
                    amount: 19900,
                    currency: 'INR',
                    keyId: 'rzp_test_ui_fixture',
                }),
            });
        });

        await page.route('**/api/payment/verify', async (route) => {
            verifyCalled = true;
            csrfForwardedToVerify = route.request().headers()['x-csrf-token'] === 'csrf_ui_fixture';
            unlocked = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    message: 'Payment verified and report unlocked.',
                }),
            });
        });

        await page.goto(`/scan/result/${scanId}`);

        const unlockButton = page.locator('#unlock-report-btn');
        await expect(unlockButton).toBeVisible();
        await unlockButton.click();

        await expect.poll(() => verifyCalled).toBeTruthy();
        await expect(page.locator('#download-report-pdf-btn')).toBeVisible();
        expect(createOrderCalled).toBe(true);
        expect(csrfForwardedToCreateOrder).toBe(true);
        expect(csrfForwardedToVerify).toBe(true);
    });

    test('surfaces verification failure and switches to retry state', async ({ page }) => {
        const scanId = 'c1234567890abcdef1234568';
        let createOrderCalled = false;
        let verifyCalled = false;
        let markFailedCalled = false;

        await page.addInitScript((id) => {
            window.sessionStorage.setItem(`scan_claim_${id}`, 'claim_token_ui_failure_fixture');
        }, scanId);

        await page.route('https://checkout.razorpay.com/v1/checkout.js', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: `
                    window.Razorpay = function(options) {
                        this.on = function() {};
                        this.open = function() {
                            setTimeout(function () {
                                options.handler({
                                    razorpay_order_id: options.order_id,
                                    razorpay_payment_id: 'pay_ui_failure_fixture',
                                    razorpay_signature: 'sig_ui_failure_fixture'
                                });
                            }, 0);
                        };
                    };
                `,
            });
        });

        await page.route('**/api/csrf', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: {
                    'set-cookie': '__csrf=csrf_ui_failure_fixture; Path=/; SameSite=Strict',
                },
                body: JSON.stringify({ csrfToken: 'csrf_ui_failure_fixture' }),
            });
        });

        await page.route(`**/api/payment/status?scanId=${scanId}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    scanId,
                    status: 'NOT_CREATED',
                    canRetry: true,
                    message: 'No payment attempt found yet.',
                    updatedAt: null,
                }),
            });
        });

        await page.route(`**/api/result/${scanId}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    scanId,
                    score: 58,
                    summary: 'Fixture free summary.',
                    risks: [
                        { title: 'Risk A', severity: 'HIGH' },
                        { title: 'Risk B', severity: 'MEDIUM' },
                    ],
                    isPaid: false,
                    paywall: true,
                    paywallMessage: 'Unlock full report for fixture failure flow.',
                    exclusionsCount: 2,
                    suggestionsCount: 2,
                    hiddenClausesCount: 2,
                }),
            });
        });

        await page.route('**/api/payment/create-order', async (route) => {
            createOrderCalled = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    orderId: 'order_ui_failure_fixture',
                    amount: 19900,
                    currency: 'INR',
                    keyId: 'rzp_test_ui_failure_fixture',
                }),
            });
        });

        await page.route('**/api/payment/verify', async (route) => {
            verifyCalled = true;
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Fixture verification failed.',
                }),
            });
        });

        await page.route('**/api/payment/mark-failed', async (route) => {
            markFailedCalled = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        await page.goto(`/scan/result/${scanId}`);
        await page.locator('#unlock-report-btn').click();

        await expect.poll(() => verifyCalled).toBeTruthy();
        await expect(page.locator('p[role=\"alert\"]').first()).toContainText('Fixture verification failed.');
        await expect(page.locator('#unlock-report-btn')).toContainText('Retry Payment');
        expect(createOrderCalled).toBe(true);
        expect(markFailedCalled).toBe(true);
    });
});
