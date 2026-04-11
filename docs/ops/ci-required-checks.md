# CI Required Checks and Branch Protection

Last updated: 2026-04-10

This repository uses GitHub Actions workflows in `.github/workflows/` as mandatory quality gates before merge.

## Required Status Checks

Configure branch protection to require these checks:

- `CI / Quality Gates`
- `CI / E2E Tests`
- `Enterprise Security Audit / security-scan`

Notes:

- Check names are derived from workflow name + job name.
- If workflow or job names are changed, update this document and branch protection immediately.

## Branch Protection Baseline

Apply to at least `main` (and `develop` if protected):

- Require a pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in these requirements
- Disallow force pushes
- Disallow branch deletion

## Automated Branch Protection Setup

You can apply the baseline via GitHub API:

```bash
GITHUB_TOKEN=... npm run ops:branch-protection -- --repo contactonetrack-del/insuranceclarity-india --branch main
```

Dry-run payload preview:

```bash
GITHUB_TOKEN=... npm run ops:branch-protection -- --repo contactonetrack-del/insuranceclarity-india --branch main --dry-run
```

Requirements:

- Token with repository admin permission (`repo` + admin scope for branch protection).
- API call succeeds only if the caller has branch protection write access.

## Manual Workflow Operations

Both `CI` and `Enterprise Security Audit` support manual runs via `workflow_dispatch`.

Use this when:

- validating hotfix branches before opening a PR
- re-running checks after transient runner/network failures
- confirming pipeline behavior after workflow edits

## Local Pre-PR Validation

Run these commands before opening a PR to reduce CI churn:

```bash
npm run lint -- --max-warnings 200
npm run typecheck
npm run test -- --run
npm run build
```
