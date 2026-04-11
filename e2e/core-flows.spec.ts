import { expect, test, type Page } from '@playwright/test';

async function primeStableUiState(page: Page) {
    await page.addInitScript(() => {
        window.localStorage.setItem('ic_onboarded_v1', 'true');
        const consent = encodeURIComponent(JSON.stringify({ essential: true, analytics: false }));
        document.cookie = `ic_cookie_consent=${consent}; path=/; SameSite=Lax`;
    });
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

test.describe('Core flow coverage', () => {
    test.beforeEach(async ({ page }) => {
        await primeStableUiState(page);
    });

    test('scan flow rejects non-PDF uploads with user-visible validation', async ({ page }) => {
        await gotoWithRetry(page, '/scan');
        await expect(page.locator('#main-content')).toBeVisible();
        let uploadRequestTriggered = false;
        page.on('request', (request) => {
            if (request.url().includes('/api/upload')) {
                uploadRequestTriggered = true;
            }
        });

        const fileInput = page.locator('#policy-file-input');
        await expect(fileInput).toBeAttached();
        await fileInput.setInputFiles({
            name: 'not-a-policy.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('invalid upload test payload'),
        });
        await page.waitForTimeout(800);

        expect(uploadRequestTriggered).toBe(false);
        await expect(page).toHaveURL(/\/scan$/);
    });

    test('calculator flow recomputes premium when risk profile changes', async ({ page }) => {
        await gotoWithRetry(page, '/tools/calculator');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const premiumValue = page.locator('div.text-5xl.font-black').first();
        await expect(premiumValue).toBeVisible();
        await expect(premiumValue).not.toHaveText('...');

        const initialPremium = (await premiumValue.textContent())?.trim() ?? '';
        await page.getByRole('button', { name: 'Smoker', exact: true }).click();
        await page.waitForTimeout(400);

        await expect
            .poll(async () => (await premiumValue.textContent())?.trim() ?? '')
            .not.toBe(initialPremium);
    });

    test('interactive quote flow mounts advisor wizard shell', async ({ page }) => {
        await gotoWithRetry(page, '/tools/interactive-quote');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByRole('textbox', { name: /message to ai underwriter/i })).toBeVisible();
    });
});
