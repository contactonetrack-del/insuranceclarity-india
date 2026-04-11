#!/usr/bin/env node

/**
 * Applies GitHub branch protection for CI required checks.
 *
 * Usage:
 *   GITHUB_TOKEN=... node scripts/ops/set-branch-protection.mjs
 *   GITHUB_TOKEN=... node scripts/ops/set-branch-protection.mjs --repo owner/name --branch main
 *   GITHUB_TOKEN=... node scripts/ops/set-branch-protection.mjs --dry-run
 */

import { execSync } from 'node:child_process'

const REQUIRED_CHECKS = [
    'CI / Quality Gates',
    'CI / E2E Tests',
    'Enterprise Security Audit / security-scan',
]

function parseArgs(argv) {
    const args = { branch: 'main', dryRun: false, repo: null }
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i]
        if (arg === '--repo') {
            args.repo = argv[i + 1]
            i += 1
        } else if (arg === '--branch') {
            args.branch = argv[i + 1] ?? args.branch
            i += 1
        } else if (arg === '--dry-run') {
            args.dryRun = true
        }
    }
    return args
}

function resolveRepo(explicitRepo) {
    if (explicitRepo) return explicitRepo
    if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY

    try {
        const remote = execSync('git remote get-url origin', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim()
        const match = remote.match(/github\\.com[:/](.+?)\\.git$/i) ?? remote.match(/github\\.com[:/](.+)$/i)
        if (!match) return null
        return match[1]
    } catch {
        return null
    }
}

async function main() {
    const { repo: repoArg, branch, dryRun } = parseArgs(process.argv.slice(2))
    const repo = resolveRepo(repoArg)
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN

    if (!repo) {
        console.error('Missing repo. Pass --repo owner/name or set GITHUB_REPOSITORY.')
        process.exit(1)
    }

    if (!token && !dryRun) {
        console.error('Missing GITHUB_TOKEN (or GH_TOKEN).')
        process.exit(1)
    }

    const [owner, name] = repo.split('/')
    if (!owner || !name) {
        console.error(`Invalid repo format: ${repo}. Expected owner/name.`)
        process.exit(1)
    }

    const body = {
        required_status_checks: {
            strict: true,
            checks: REQUIRED_CHECKS.map((context) => ({ context })),
        },
        enforce_admins: true,
        required_pull_request_reviews: {
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
            required_approving_review_count: 1,
        },
        restrictions: null,
        required_linear_history: true,
        allow_force_pushes: false,
        allow_deletions: false,
        block_creations: false,
        required_conversation_resolution: true,
        lock_branch: false,
        allow_fork_syncing: true,
    }

    const endpoint = `https://api.github.com/repos/${owner}/${name}/branches/${branch}/protection`

    if (dryRun) {
        console.log(JSON.stringify({ endpoint, body }, null, 2))
        return
    }

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const text = await response.text()
        console.error(`GitHub API error (${response.status}): ${text}`)
        process.exit(1)
    }

    const data = await response.json()
    console.log(`Branch protection applied for ${repo}#${branch}`)
    console.log(`Required checks: ${REQUIRED_CHECKS.join(', ')}`)
    console.log(`URL: ${data.url}`)
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
})
