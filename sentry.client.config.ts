import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (optional - requires additional configuration)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // Set environment
    environment: process.env.NODE_ENV,

    // Only send errors in production
    enabled: process.env.NODE_ENV === 'production',

    // Filter out non-actionable errors
    beforeSend(event) {
        // Don't send errors from development
        if (process.env.NODE_ENV !== 'production') {
            return null;
        }

        // Filter out specific errors if needed
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
            return null;
        }

        return event;
    },

    // Add custom tags
    initialScope: {
        tags: {
            app: 'insurance-clarity',
            platform: 'web',
        },
    },
});
