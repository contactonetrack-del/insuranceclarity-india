import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

    // ────────────────────────────────────────────────────────────────────────
    // TRACING — use tracesSampler for path-aware sampling.
    //
    // Production: 5 % overall (skip health checks, static assets, cron pings).
    //             High-value transactions (payment, scan, auth) get 20 %.
    // Development: 100 % for full local visibility.
    // ────────────────────────────────────────────────────────────────────────
    tracesSampler: (samplingContext) => {
        if (!isProd) return 1.0; // 100% in dev

        const url = samplingContext?.transactionContext?.name ?? "";

        // Skip noisy low-value paths entirely
        if (
            url.includes("/_next/") ||
            url.includes("/api/healthcheck") ||
            url.includes("/api/cron/") ||
            url.startsWith("/robots") ||
            url.startsWith("/sitemap")
        ) {
            return 0;
        }

        // Higher sampling for business-critical flows
        if (
            url.includes("/api/payment") ||
            url.includes("/api/subscription") ||
            url.includes("/api/scan") ||
            url.includes("/api/auth")
        ) {
            return 0.2; // 20%
        }

        return 0.05; // 5% default for everything else
    },

    // ────────────────────────────────────────────────────────────────────────
    // SESSION REPLAY
    // Error replay at 100% is fine — these are already failures.
    // Session replay in prod: 1% to control egress cost.
    // ────────────────────────────────────────────────────────────────────────
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: isProd ? 0.01 : 0.1,

    debug: false,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});

