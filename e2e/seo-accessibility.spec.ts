import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const criticalRoutes = ['/', '/pricing', '/about', '/contact', '/tools/calculator'] as const;

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
            await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60000 });
            return;
        } catch (error) {
            if (attempt === 2) throw error;
            await page.waitForTimeout(750);
        }
    }
}

async function assertSeoContract(page: Page) {
    await expect(page).toHaveTitle(/.+/);

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();

    const description = page.locator('head meta[name="description"]').first();
    await expect(description).toHaveAttribute('content', /.+/);

    const canonical = page.locator('head link[rel="canonical"]').first();
    await expect(canonical).toHaveAttribute('href', /.+/);

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScripts.first()).toBeAttached();
}

async function assertA11yContract(page: Page) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

    const seriousOrCritical = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(
        seriousOrCritical,
        seriousOrCritical
            .map((v) => `${v.id} [${v.impact}] (${v.nodes.length} nodes)`)
            .join('\n'),
    ).toHaveLength(0);
}

test.describe('SEO + Accessibility Formal Audit', () => {
    test('critical routes satisfy SEO metadata contract', async ({ page }) => {
        test.setTimeout(180000);

        for (const route of criticalRoutes) {
            await test.step(`seo ${route}`, async () => {
                const routePage = await page.context().newPage();
                try {
                    await primeStableUiState(routePage);
                    await gotoWithRetry(routePage, route);
                    await expect(routePage.locator('main#main-content').first()).toBeVisible();
                    await assertSeoContract(routePage);
                } finally {
                    await routePage.close();
                }
            });
        }
    });

    test('critical routes satisfy WCAG serious/critical baseline', async ({ page }) => {
        test.setTimeout(180000);

        for (const route of criticalRoutes) {
            await test.step(`a11y ${route}`, async () => {
                const routePage = await page.context().newPage();
                try {
                    await primeStableUiState(routePage);
                    await gotoWithRetry(routePage, route);
                    await expect(routePage.locator('main#main-content').first()).toBeVisible();
                    await assertA11yContract(routePage);
                } finally {
                    await routePage.close();
                }
            });
        }
    });
});
