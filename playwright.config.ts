import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const shouldManageWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== '1';
const forceFreshServer = process.env.PLAYWRIGHT_FORCE_FRESH_SERVER === '1';
const localE2eSecret = process.env.E2E_TEST_SECRET ?? 'local-e2e-test-secret';
const devCommand =
    process.platform === 'win32'
        ? 'npm run dev -- --webpack --hostname 127.0.0.1 --port 3000'
        : 'npm run dev -- --hostname 127.0.0.1 --port 3000';

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',

    // Global timeout for each test (60s to account for AI scan latency)
    timeout: 60 * 1000,
    
    expect: {
        // Timeout for expect assertions
        timeout: 10 * 1000,
    },

    // Run tests in parallel
    fullyParallel: false,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: 1,

    // Reporter to use
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],

    // Shared settings for all the projects below
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL,

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Uncomment for cross-browser testing
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
        // Mobile testing
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
    ],

    // Run your local dev server before starting the tests
    webServer: shouldManageWebServer
        ? {
            command: devCommand,
            env: {
                ...process.env,
                NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS: 'true',
                SEARCH_BACKEND: process.env.SEARCH_BACKEND ?? 'postgres',
                E2E_TEST_SECRET: localE2eSecret,
                RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ?? 'test_secret_for_local_e2e',
            },
            url: baseURL,
            reuseExistingServer: !process.env.CI && !forceFreshServer,
            timeout: 120 * 1000,
        }
        : undefined,
});
