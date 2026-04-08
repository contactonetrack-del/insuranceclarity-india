import { test, expect, type Page } from '@playwright/test';

/**
 * Homepage E2E Tests
 * Critical user journey: Landing page experience
 */
async function gotoHome(page: Page) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
}

async function primeStableHomepageState(page: Page) {
    await page.addInitScript(() => {
        window.localStorage.setItem('ic_onboarded_v1', 'true');
        const consent = encodeURIComponent(JSON.stringify({ essential: true, analytics: false }));
        document.cookie = `ic_cookie_consent=${consent}; path=/; SameSite=Lax`;
    });
}

test.beforeEach(async ({ page }) => {
    await primeStableHomepageState(page);
});

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await gotoHome(page);
    });

    test('should display the hero section with main headline', async ({ page }) => {
        await expect(page.getByText('Discover What Insurance')).toBeVisible();
        await expect(page.getByText('Companies Hide From You')).toBeVisible();
    });

    test('should display the tagline', async ({ page }) => {
        await expect(page.getByText("India's Most Transparent Insurance Platform", { exact: true })).toBeVisible();
    });

    test('should have working CTA buttons', async ({ page }) => {
        const exploreCTA = page.getByRole('button', { name: /Explore Hidden Facts/i }).first();
        await expect(exploreCTA).toBeVisible();

        const calculatorCTA = page.getByRole('button', { name: /Estimate Premium/i }).first();
        await expect(calculatorCTA).toBeVisible();
    });

    test('should display statistics section', async ({ page }) => {
        const statsSection = page.locator('section').nth(1);
        await expect(statsSection.getByText('150+', { exact: true }).first()).toBeVisible();
        await expect(statsSection.getByText('Hidden Facts', { exact: true })).toBeVisible();
        await expect(statsSection.getByText('Insurance Types', { exact: true })).toBeVisible();
    });

    test('should display insurance categories', async ({ page }) => {
        await expect(page.getByText('Explore Insurance Types')).toBeVisible();
        await expect(page.getByRole('link', { name: /^Life Insurance$/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /^Health Insurance$/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /^Motor Insurance$/ })).toBeVisible();
    });

    test('should display tools section', async ({ page }) => {
        await expect(page.getByText('Tools to Make Better Decisions')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Policy AI Auditor' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Hidden Facts' })).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
        await expect(page.getByRole('navigation')).toBeVisible();
        await expect(page.getByRole('banner').getByRole('link', { name: /InsuranceClarity Logo/i })).toBeVisible();
    });

    test('should toggle dark/light theme', async ({ page }) => {
        const themeToggle = page.getByRole('button', { name: /Switch to (dark|light) mode/i });

        const initialDarkMode = await page.evaluate(() =>
            document.documentElement.classList.contains('dark')
        );

        await themeToggle.click();
        await page.waitForTimeout(500);

        const updatedDarkMode = await page.evaluate(() =>
            document.documentElement.classList.contains('dark')
        );
        expect(updatedDarkMode).not.toBe(initialDarkMode);
    });

    test('should show and dismiss the onboarding tour for first-time visitors', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.removeItem('ic_onboarded_v1');
        });
        await gotoHome(page);

        const tour = page.getByRole('dialog', { name: /welcome to insuranceclarity/i });
        await expect(tour).toBeVisible();
        await page.getByRole('button', { name: /skip tour/i }).first().click();
        await expect(tour).toBeHidden();
    });
});

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await gotoHome(page);
    });

    test('should navigate to insurance category page', async ({ page }) => {
        await page.getByRole('link', { name: /Life Insurance Term, Whole Life, ULIPs/i }).click();
        await expect(page).toHaveURL(/\/insurance\/life/);
    });

    test('should navigate to tools page', async ({ page }) => {
        const toolsSection = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Tools to Make Better Decisions' }),
        });
        await toolsSection.getByRole('link', { name: /Hidden Facts/i }).click();
        await expect(page).toHaveURL(/\/tools\/hidden-facts/);
    });
});

test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await gotoHome(page);
    });

    test('should have proper page title', async ({ page }) => {
        await expect(page).toHaveTitle(/InsuranceClarity/);
    });

    test('should have meta description', async ({ page }) => {
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /insurance/i);
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
    });
});
