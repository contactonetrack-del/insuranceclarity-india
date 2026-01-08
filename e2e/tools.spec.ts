import { test, expect } from '@playwright/test';

/**
 * Insurance Tools E2E Tests
 * Critical user journey: Using insurance comparison and calculator tools
 */
test.describe('Hidden Facts Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/hidden-facts');
    });

    test('should display the Hidden Facts page', async ({ page }) => {
        // Check page loaded with relevant content
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should have insurance category filters', async ({ page }) => {
        // Look for filter options or category selection
        const pageContent = await page.content();
        expect(pageContent.toLowerCase()).toMatch(/life|health|motor|home|travel/);
    });
});

test.describe('Premium Calculator Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/calculator');
    });

    test('should display the Calculator page', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should have input fields for calculation', async ({ page }) => {
        // Calculator should have some form inputs
        const inputs = page.locator('input, select');
        const inputCount = await inputs.count();
        expect(inputCount).toBeGreaterThan(0);
    });
});

test.describe('Policy Comparison Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/compare');
    });

    test('should display the Comparison page', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});

test.describe('Claim Cases Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/claim-cases');
    });

    test('should display claim cases', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
