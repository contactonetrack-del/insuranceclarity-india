import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 * Critical user journey: Landing page experience
 */
test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the hero section with main headline', async ({ page }) => {
        // Check for the main headline
        await expect(page.getByText('Discover What Insurance')).toBeVisible();
        await expect(page.getByText('Companies Hide From You')).toBeVisible();
    });

    test('should display the tagline', async ({ page }) => {
        await expect(page.getByText("India's Most Transparent Insurance Platform")).toBeVisible();
    });

    test('should have working CTA buttons', async ({ page }) => {
        // Primary CTA
        const exploreCTA = page.getByRole('button', { name: /Explore Hidden Facts/i });
        await expect(exploreCTA).toBeVisible();

        // Secondary CTA
        const calculatorCTA = page.getByRole('button', { name: /Calculate Premium/i });
        await expect(calculatorCTA).toBeVisible();
    });

    test('should display statistics section', async ({ page }) => {
        await expect(page.getByText('150+')).toBeVisible();
        await expect(page.getByText('Hidden Facts')).toBeVisible();
        await expect(page.getByText('Insurance Types')).toBeVisible();
    });

    test('should display insurance categories', async ({ page }) => {
        await expect(page.getByText('Explore Insurance Types')).toBeVisible();
        await expect(page.getByText('Life Insurance')).toBeVisible();
        await expect(page.getByText('Health Insurance')).toBeVisible();
        await expect(page.getByText('Motor Insurance')).toBeVisible();
    });

    test('should display tools section', async ({ page }) => {
        await expect(page.getByText('Tools to Make Better Decisions')).toBeVisible();
        await expect(page.getByText('Hidden Facts Revealer')).toBeVisible();
        await expect(page.getByText('Premium Calculator')).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
        // Check header navigation exists
        await expect(page.getByRole('navigation')).toBeVisible();
        await expect(page.getByText('InsuranceClarity')).toBeVisible();
    });

    test('should toggle dark/light theme', async ({ page }) => {
        // Find theme toggle button (usually has sun/moon icon)
        const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first();

        // Get initial state
        const htmlElement = page.locator('html');
        const initialClass = await htmlElement.getAttribute('class');

        // Click to toggle
        await themeToggle.click();
        await page.waitForTimeout(500); // Wait for theme transition

        // Verify class changed (light/dark toggle)
        const newClass = await htmlElement.getAttribute('class');
        expect(newClass).not.toBe(initialClass);
    });
});

test.describe('Navigation', () => {
    test('should navigate to insurance category page', async ({ page }) => {
        await page.goto('/');

        // Click on Life Insurance card
        await page.getByText('Life Insurance').first().click();

        // Should navigate to the life insurance page
        await expect(page).toHaveURL(/\/insurance\/life/);
    });

    test('should navigate to tools page', async ({ page }) => {
        await page.goto('/');

        // Click on Hidden Facts tool
        await page.getByText('Hidden Facts Revealer').first().click();

        // Should navigate to the hidden facts page
        await expect(page).toHaveURL(/\/tools\/hidden-facts/);
    });
});

test.describe('Accessibility', () => {
    test('should have proper page title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/InsuranceClarity/);
    });

    test('should have meta description', async ({ page }) => {
        await page.goto('/');
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /insurance/i);
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/');

        // Tab through focusable elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Some element should be focused
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
    });
});
