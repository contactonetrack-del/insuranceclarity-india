import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

    // ── Tracing ──────────────────────────────────────────────────────────────
    // Production: 5% default, 20% for payment/scan/auth, 0% for cron/health.
    // Development: 100% for full observability.
    tracesSampler: (samplingContext) => {
        if (!isProd) return 1.0;

        const url = samplingContext?.transactionContext?.name ?? "";

        if (
            url.includes("/api/healthcheck") ||
            url.includes("/api/cron/") ||
            url.includes("/_next/")
        ) {
            return 0;
        }

        if (
            url.includes("/api/payment") ||
            url.includes("/api/subscription") ||
            url.includes("/api/scan") ||
            url.includes("/api/auth") ||
            url.includes("/api/jobs/")
        ) {
            return 0.2;
        }

        return 0.05;
    },

    debug: false,
    sendDefaultPii: false,
});

