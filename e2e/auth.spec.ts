import { expect, test } from '@playwright/test';

const E2E_TEST_SECRET = process.env.E2E_TEST_SECRET;
const TEST_SECRET = E2E_TEST_SECRET ?? '';

test.describe('Auth OTP Lifecycle (Critical)', () => {
    test('signup/login via deterministic OTP harness creates a valid session and unlocks protected dashboard route', async ({ page, request }) => {
        test.skip(!E2E_TEST_SECRET, 'E2E_TEST_SECRET is required for auth OTP deterministic harness.');
        test.setTimeout(120000);

        const email = `e2e-auth-${Date.now()}@example.com`;

        try {
            const csrfResponse = await request.get('/api/csrf');
            expect(csrfResponse.status()).toBe(200);
            const csrfPayload = await csrfResponse.json() as { csrfToken?: string };
            const csrfToken = csrfPayload.csrfToken;
            expect(csrfToken).toBeTruthy();

            await page.context().addCookies([
                {
                    name: '__csrf',
                    value: csrfToken ?? '',
                    domain: '127.0.0.1',
                    path: '/',
                },
            ]);

            await page.goto('/auth/signin?callbackUrl=%2Fdashboard');

            await page.fill('#signin-email', email);
            const sendOtpResponse = page.waitForResponse((response) =>
                response.url().includes('/api/auth/otp/send'),
            );
            await page.locator('form').first().locator('button[type="submit"]').click();

            const resolvedResponse = await sendOtpResponse;
            if (!resolvedResponse.ok()) {
                const body = await resolvedResponse.text();
                throw new Error(`OTP send failed: ${resolvedResponse.status()} ${body}`);
            }

            await expect(page.locator('#signin-otp')).toBeVisible({ timeout: 20000 });

            let otp = '';
            for (let attempt = 0; attempt < 15; attempt += 1) {
                const otpResponse = await request.get(`/api/test-utils/auth-otp?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'x-e2e-test-secret': TEST_SECRET,
                    },
                });

                if (otpResponse.status() === 200) {
                    const payload = await otpResponse.json() as { otp: string };
                    otp = payload.otp;
                    break;
                }

                await page.waitForTimeout(250);
            }

            expect(otp).toMatch(/^\d{6}$/);

            await page.fill('#signin-otp', otp);
            const signInResponse = page.waitForResponse((response) =>
                response.url().includes('/api/auth/sign-in/email-otp'),
            );
            await page.locator('form').first().locator('button[type="submit"]').click();

            const resolvedSignIn = await signInResponse;
            if (!resolvedSignIn.ok()) {
                const body = await resolvedSignIn.text();
                throw new Error(`OTP sign-in failed: ${resolvedSignIn.status()} ${body}`);
            }

            let sessionEmail: string | undefined;
            for (let attempt = 0; attempt < 20; attempt += 1) {
                const sessionResponse = await page.request.get('/api/auth/get-session');
                if (sessionResponse.status() === 200) {
                    const sessionPayload = await sessionResponse.json() as { user?: { email?: string } | null };
                    sessionEmail = sessionPayload.user?.email ?? undefined;
                    if (sessionEmail === email) {
                        break;
                    }
                }

                await page.waitForTimeout(250);
            }

            expect(sessionEmail).toBe(email);

            const dashboardPage = await page.context().newPage();
            try {
                await dashboardPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
                await expect(dashboardPage).toHaveURL(/\/dashboard/);
                await expect(dashboardPage).not.toHaveURL(/\/auth\/signin/);
            } finally {
                await dashboardPage.close();
            }
        } finally {
            if (E2E_TEST_SECRET) {
                try {
                    await request.delete('/api/test-utils/auth-otp', {
                        headers: {
                            'content-type': 'application/json',
                            'x-e2e-test-secret': TEST_SECRET,
                        },
                        data: { email },
                    });
                } catch {
                    // Cleanup best-effort; ignore failures when request context is disposed.
                }
            }
        }
    });
});
