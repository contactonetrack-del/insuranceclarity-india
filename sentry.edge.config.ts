import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

    // ── Tracing ──────────────────────────────────────────────────────────────
    // Edge middleware is lightweight — keep sampling low to avoid cost.
    // Production: 5%, Development: 100%.
    tracesSampler: (samplingContext) => {
        if (!isProd) return 1.0;

        const url = samplingContext?.transactionContext?.name ?? "";

        // Don't trace middleware on static/health paths
        if (url.includes("/_next/") || url.includes("/api/healthcheck")) {
            return 0;
        }

        return 0.05;
    },

    debug: false,
});

