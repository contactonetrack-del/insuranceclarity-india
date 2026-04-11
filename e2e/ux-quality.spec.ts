import AxeBuilder from '@axe-core/playwright';
import { devices, expect, test, type Page } from '@playwright/test';

const desktopRoutes = ['/', '/scan', '/pricing', '/tools/calculator'] as const;
const mobileRoutes = ['/', '/scan', '/tools/calculator'] as const;

async function primeStableUiState(page: Page) {
    await page.addInitScript(() => {
        window.localStorage.setItem('ic_onboarded_v1', 'true');
        const consent = encodeURIComponent(JSON.stringify({ essential: true, analytics: false }));
        document.cookie = `ic_cookie_consent=${consent}; path=/; SameSite=Lax`;
    });
}

async function expectNoHorizontalOverflow(page: Page) {
    const hasOverflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth > window.innerWidth + 1;
    });
    expect(hasOverflow).toBe(false);
}

async function gotoWithRetry(page: Page, route: string) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 45000 });
            return;
        } catch (error) {
            if (attempt === 1) throw error;
        }
    }
}

async function openMobileMenu(page: Page) {
    const menuButton = page.locator('button[aria-controls="mobile-menu"]').first();
    await expect(menuButton).toBeVisible();
    await page.waitForLoadState('networkidle');

    for (let attempt = 0; attempt < 3; attempt += 1) {
        await menuButton.click({ force: attempt > 0 });
        if ((await menuButton.getAttribute('aria-expanded')) === 'true') {
            return menuButton;
        }
        await page.waitForTimeout(150);
    }

    await menuButton.press('Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    return menuButton;
}

async function expectNoSeriousA11yViolations(page: Page) {
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

test.describe('UX Quality', () => {
    test.beforeEach(async ({ page }) => {
        await primeStableUiState(page);
    });

    test('desktop critical routes meet accessibility baseline', async ({ page }) => {
        test.setTimeout(180000);

        for (const route of desktopRoutes) {
            await test.step(`a11y ${route}`, async () => {
                await gotoWithRetry(page, route);
                await expect(page.locator('main#main-content').first()).toBeVisible();
                await expectNoSeriousA11yViolations(page);
            });
        }
    });

    test('skip link focuses the main content region', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.keyboard.press('Tab');

        const skipLink = page.locator('a[href="#main-content"]').first();
        await expect(skipLink).toBeVisible();
        await skipLink.press('Enter');

        await expect(page.locator('#main-content')).toBeFocused();
    });

    test.describe('mobile stability', () => {
        test.use({
            viewport: devices['Pixel 5'].viewport,
            userAgent: devices['Pixel 5'].userAgent,
            deviceScaleFactor: devices['Pixel 5'].deviceScaleFactor,
            isMobile: devices['Pixel 5'].isMobile,
            hasTouch: devices['Pixel 5'].hasTouch,
        });

        test('critical routes do not overflow horizontally', async ({ page }) => {
            for (const route of mobileRoutes) {
                await test.step(`mobile layout ${route}`, async () => {
                    await gotoWithRetry(page, route);
                    await expect(page.locator('main#main-content').first()).toBeVisible();
                    await expectNoHorizontalOverflow(page);
                });
            }
        });

        test('mobile navigation is accessible and operable', async ({ page }) => {
            await gotoWithRetry(page, '/');

            const menuButton = await openMobileMenu(page);
            await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

            const dialog = page.locator('#mobile-menu');
            await expect(dialog).toBeVisible();
            await expect(dialog.getByRole('navigation')).toBeVisible();
            await expectNoHorizontalOverflow(page);

            await page.keyboard.press('Escape');
            await expect(dialog).toBeHidden();
        });
    });
});
