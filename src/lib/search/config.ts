/**
 * Search backend configuration.
 *
 * The runtime search path is exclusively PostgreSQL (via Prisma).
 * Meilisearch has been fully decommissioned as of 2026-Q2.
 * See database-search.ts for the Postgres FTS implementation.
 */

export type SearchBackend = 'postgres';

export function getSearchBackend(): SearchBackend {
    return 'postgres';
}
