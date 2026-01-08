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

    // Filter out non-actionable errors and sanitize PII
    beforeSend(event) {
        // Don't send errors from development
        if (process.env.NODE_ENV !== 'production') {
            return null;
        }

        // Filter out specific errors if needed
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
            return null;
        }

        // Sanitize URL query params (remove potential PII)
        if (event.request?.url) {
            try {
                const url = new URL(event.request.url);
                const sensitiveParams = ['email', 'phone', 'name', 'aadhaar', 'pan', 'dob', 'age'];
                sensitiveParams.forEach(param => url.searchParams.delete(param));
                event.request.url = url.toString();
            } catch {
                // URL parsing failed, continue
            }
        }

        // Scrub request body data
        if (event.request?.data) {
            event.request.data = '[REDACTED]';
        }

        // Sanitize breadcrumbs
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                // Redact form input values
                if (breadcrumb.category === 'ui.input') {
                    return { ...breadcrumb, message: '[input]', data: undefined };
                }
                // Redact XHR/fetch request bodies
                if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
                    if (breadcrumb.data) {
                        breadcrumb.data = { ...breadcrumb.data, body: undefined };
                    }
                }
                return breadcrumb;
            });
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
