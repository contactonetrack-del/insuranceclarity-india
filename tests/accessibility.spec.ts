import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Target key marketing and conversion pages for a11y regressions
const TARGET_ROUTES = [
    '/',
    '/insurance/term-life',
    '/insurance/maternity',
    '/tools/ai-advisor'
];

test.describe('Accessibility (WCAG 2.1) Audits', () => {

    for (const route of TARGET_ROUTES) {
        test(`Should not have any automatically detectable accessibility issues on ${route}`, async ({ page }) => {
            // 1. Navigate to the page
            await page.goto(route);

            // 2. Wait for main content to load
            await page.waitForLoadState('networkidle');

            // 3. Scan the page with axe-core
            // Exclude known third-party iframes if necessary (e.g., chat widgets)
            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            // 4. Assert there are no violations
            expect(accessibilityScanResults.violations).toEqual([]);
        });
    }

});
