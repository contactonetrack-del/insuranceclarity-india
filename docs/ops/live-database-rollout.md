# Live Database Rollout

## Current status

The configured Prisma target for this workspace is now up to date.

As of 2026-04-09, Vercel production, preview, and development all resolve to the same database target. `npm run db:rollout:vercel-envs` now verifies that before you attempt any duplicate seed/backfill rollout.

Applied on 2026-04-09:

1. `_add_error_monitoring_tables`
2. `20260331192250_add_mvp_models`
3. `20260402212315_add_role_subscription_model`
4. `20260407_add_performance_indexes`
5. `20260408235500_better_auth_cutover`
6. `20260409120000_domain_enums_hardening`
7. `20260409163000_enable_vector_and_search_extensions`
8. `20260409181500_add_audit_log_table`

The target is now on Neon PostgreSQL 17 with `pg_trgm` and `vector` enabled, and the
search index rollout has also been executed.

## Safe rollout sequence

1. Create a fresh Neon branch or point-in-time restore checkpoint before applying anything.
2. Run `npx prisma migrate deploy` against the target branch.
3. Run `npm run db:search:indexes` against the same target.
4. Run `npm run db:seed` if the target needs the sample search corpus.
5. Run `npm run db:embeddings:backfill` after the `vector` extension and columns are in place.
6. Verify auth tables exist and a sign-in/session round-trip works.
7. Promote the branch or deploy the application against the migrated branch.

## Rollback

1. If rollout fails before promotion, discard the Neon branch and keep production on the old parent branch.
2. If rollout fails after partial application, restore from the Neon checkpoint or point-in-time restore.
3. Do not hand-edit Better Auth tables in production; revert by restoring the branch state instead.

## Notes

- The connected Neon MCP account in this session does not expose the application project, so this rollout was executed through the configured Prisma database credentials rather than the Neon MCP branch workflow.
- `docs/ops/postgres-search-indexes.sql` intentionally uses `CREATE INDEX CONCURRENTLY` and is kept outside Prisma migration files to avoid transactional limitations during deploy.
- The original migration chain had a gap: `AuditLog` existed in Prisma but not in the migration history. That has been corrected with `20260409181500_add_audit_log_table`.
