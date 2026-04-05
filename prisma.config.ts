import "dotenv/config";

/**
 * Prisma configuration — NEVER hardcode credentials here.
 * DATABASE_URL is loaded from .env (blocked from git by .gitignore).
 * Rotate credentials at: https://console.neon.tech → Settings → Connection Details
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "[prisma.config] DATABASE_URL is not set. " +
        "Copy .env.example to .env and fill in your Neon PostgreSQL URL."
    );
}

export default {
    datasource: {
        url: databaseUrl,
    },
    migrations: {
        seed: 'npx tsx prisma/seed.ts',
    },
};
