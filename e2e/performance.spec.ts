import { expect, test, type Page } from '@playwright/test';

const performanceRoutes = ['/', '/scan', '/pricing', '/tools/calculator'] as const;

function envNumber(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) return fallback;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

const PERF_LIMITS_MS = {
    domContentLoaded: envNumber('PERF_E2E_MAX_DCL_MS', 60000),
    loadEvent: envNumber('PERF_E2E_MAX_LOAD_MS', 90000),
};

async function primeStableUiState(page: Page) {
    await page.addInitScript(() => {
        window.localStorage.setItem('ic_onboarded_v1', 'true');
        const consent = encodeURIComponent(JSON.stringify({ essential: true, analytics: false }));
        document.cookie = `ic_cookie_consent=${consent}; path=/; SameSite=Lax`;
    });
}

async function gotoWithRetry(page: Page, route: string) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            await page.goto(route, { waitUntil: 'load', timeout: 60000 });
            return;
        } catch (error) {
            if (attempt === 2) throw error;
            await page.waitForTimeout(750);
        }
    }
}

test.describe('Performance Baseline', () => {
    test.beforeEach(async ({ page }) => {
        await primeStableUiState(page);
    });

    for (const route of performanceRoutes) {
        test(`route ${route} stays within navigation timing budgets`, async ({ page }) => {
            test.setTimeout(180000);

            // Warm route first to avoid including first-hit compilation in baseline timing.
            await gotoWithRetry(page, route);
            await expect(page.locator('main#main-content').first()).toBeVisible();
            await page.waitForTimeout(250);

            await gotoWithRetry(page, route);
            await expect(page.locator('main#main-content').first()).toBeVisible();

            const metrics = await page.evaluate(() => {
                const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                if (!nav) {
                    return null;
                }

                return {
                    domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
                    loadEvent: nav.loadEventEnd - nav.startTime,
                };
            });

            expect(metrics).not.toBeNull();
            expect(metrics!.domContentLoaded).toBeLessThan(PERF_LIMITS_MS.domContentLoaded);
            expect(metrics!.loadEvent).toBeLessThan(PERF_LIMITS_MS.loadEvent);
        });
    }
});
