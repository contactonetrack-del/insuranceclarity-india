#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const strictMode = process.argv.includes('--strict')

const maxFileSizes = [
    { file: 'src/components/Header.tsx', maxBytes: 12 * 1024 },
    { file: 'src/app/dashboard/page.tsx', maxBytes: 6 * 1024 },
]

const mustNotExistPaths = [
    'src/app/scan/scan.css',
    'src/db',
    'src/queue',
    'postcss.config.js.bak',
    'temp-0visbs.js',
    'csrf.jar',
]

const rootArtifactPatterns = [
    /^build-log\.txt$/i,
    /^lint-.*\.txt$/i,
]

const schemaPath = 'prisma/schema.prisma'
const schemaForbiddenPatterns = [
    { label: 'model Account', regex: /\bmodel\s+Account\s*\{/m },
    { label: 'model Session', regex: /\bmodel\s+Session\s*\{/m },
    { label: 'model VerificationToken', regex: /\bmodel\s+VerificationToken\s*\{/m },
]

const requiredMigrationPath = 'prisma/migrations/20260411111834_drop_legacy_nextauth_models/migration.sql'

/** @type {string[]} */
const findings = []

function abs(relPath) {
    return path.join(repoRoot, relPath)
}

for (const { file, maxBytes } of maxFileSizes) {
    const filePath = abs(file)
    if (!fs.existsSync(filePath)) {
        findings.push(`[missing-file] expected ${file}`)
        continue
    }
    const size = fs.statSync(filePath).size
    if (size > maxBytes) {
        findings.push(`[file-size] ${file} is ${size} bytes (max allowed ${maxBytes})`)
    }
}

for (const relPath of mustNotExistPaths) {
    if (fs.existsSync(abs(relPath))) {
        findings.push(`[path-present] ${relPath} should not exist`)
    }
}

const rootEntries = fs.readdirSync(repoRoot)
for (const entry of rootEntries) {
    if (rootArtifactPatterns.some((pattern) => pattern.test(entry))) {
        findings.push(`[root-artifact] ${entry} should not be committed`)
    }
}

const schemaAbsolutePath = abs(schemaPath)
if (!fs.existsSync(schemaAbsolutePath)) {
    findings.push(`[missing-file] expected ${schemaPath}`)
} else {
    const schemaContent = fs.readFileSync(schemaAbsolutePath, 'utf8')
    for (const forbidden of schemaForbiddenPatterns) {
        if (forbidden.regex.test(schemaContent)) {
            findings.push(`[schema-debris] found ${forbidden.label} in ${schemaPath}`)
        }
    }
}

if (!fs.existsSync(abs(requiredMigrationPath))) {
    findings.push(`[missing-migration] expected ${requiredMigrationPath}`)
}

console.log(`\nMaintainability Hotspot Audit (${strictMode ? 'strict' : 'non-blocking'})`)
console.log('Checks:')
console.log('- Header/dashboard file-size guardrails')
console.log('- Legacy hotspot paths/artifacts removed')
console.log('- Legacy NextAuth Prisma models removed')
console.log('- Cleanup migration presence')

if (findings.length === 0) {
    console.log('\nNo maintainability hotspot regressions detected.')
    process.exit(0)
}

console.log('\nDetected maintainability hotspot regressions:')
for (const finding of findings) {
    console.log(`- ${finding}`)
}

if (strictMode) {
    console.log('\nHotspot audit failed in strict mode.')
    process.exit(1)
}

console.log('\nHotspot audit completed with warnings (non-blocking).')
process.exit(0)

