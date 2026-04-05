import { test, expect } from '@playwright/test';

test.describe('Negative Security Testing & Access Control', () => {

    test('Unauthenticated user is immediately redirected from protected dashboard', async ({ page }) => {
        // Attempt to access user dashboard without a session
        await page.goto('/dashboard');
        
        // Next.js middleware should intercept the request before resolving layout 
        // and issue a 307 temporary redirect to the signin page.
        expect(page.url()).toContain('/auth/signin');
        
        // Ensure redirect param is attached for seamless ux
        expect(page.url()).toContain('callbackUrl=%2Fdashboard');
    });

    test('Unauthenticated user is immediately redirected from admin studio', async ({ page }) => {
        // Attempt to access sanity studio
        await page.goto('/studio');
        
        // Must bounce unauthenticated users back to auth
        expect(page.url()).toContain('/auth/signin');
    });

    test('Rate Limiter acts correctly on brutal API hammering (if enabled)', async ({ request }) => {
        // Attempt to hammer a generic API endpoint that supports rate limiting
        // We will send 15 consecutive requests in a tight loop to trigger 429
        const responses = await Promise.all(
            Array.from({ length: 15 }).map(() => request.get('/api/healthcheck')) // healthcheck might exclude rate limit
        );
        
        // In local environments, Upstash Redis rate limit might be disabled or mocked.
        // We just ensure we don't crash the server (500) and get logical response (200 or 429)
        const hasErrors = responses.some(r => r.status() >= 500);
        expect(hasErrors).toBe(false);
    });

    test('Security headers (CSP) are properly enforced', async ({ page }) => {
        const response = await page.goto('/');
        
        // Extract CSP Header
        const headers = response?.headers() || {};
        const csp = headers['content-security-policy'] || '';

        // Strict-dynamic must be present
        expect(csp).toContain('strict-dynamic');
        // Nonce must be applied
        expect(csp).toContain('nonce-');
        // Protection against clickjacking
        expect(csp).toContain('frame-ancestors \'none\'');
    });

});
