#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const strictMode = process.argv.includes('--strict')
const maxFindings = Number.parseInt(process.env.ARCH_AUDIT_MAX_FINDINGS ?? '-1', 10)

const scopedPaths = ['src/app', 'src/components', 'src/features']
const repositoryBoundaryScopedPaths = ['src/app', 'src/services', 'src/lib', 'src/features']
const fileExtensions = new Set(['.ts', '.tsx'])
const ignorePathRegexes = [/\/__tests__\//, /\.test\./, /\.spec\./, /\/node_modules\//, /\/\.next\//]
const forbiddenImportRegex = /from\s+['"]@\/(?:repositories|db|lib\/prisma)(?:\/[^'"]*)?['"]/g
const directPrismaImportRegex = /from\s+['"]@\/lib\/prisma['"]/g
const directPrismaAllowlistRegexes = [
    /^src\/services\/e2e-test\.service\.ts$/,
]

function walk(targetPath, acc) {
    const absolute = path.join(repoRoot, targetPath)
    if (!fs.existsSync(absolute)) return
    const stat = fs.statSync(absolute)
    if (stat.isFile()) {
        if (fileExtensions.has(path.extname(absolute))) acc.push(absolute)
        return
    }
    for (const entry of fs.readdirSync(absolute)) walk(path.join(targetPath, entry), acc)
}

function toPosix(p) {
    return p.split(path.sep).join('/')
}

function shouldIgnore(filePath) {
    return ignorePathRegexes.some((rx) => rx.test(filePath))
}

function isDirectPrismaAllowed(filePath) {
    return directPrismaAllowlistRegexes.some((rx) => rx.test(filePath))
}

const files = []
for (const target of scopedPaths) walk(target, files)

const findings = []
for (const file of files) {
    const rel = toPosix(path.relative(repoRoot, file))
    if (shouldIgnore(rel)) continue
    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]
        if (forbiddenImportRegex.test(line)) {
            findings.push({ file: rel, line: i + 1, text: line.trim() })
        }
        forbiddenImportRegex.lastIndex = 0
    }
}

const repositoryBoundaryFiles = []
for (const target of repositoryBoundaryScopedPaths) walk(target, repositoryBoundaryFiles)

for (const file of repositoryBoundaryFiles) {
    const rel = toPosix(path.relative(repoRoot, file))
    if (shouldIgnore(rel) || isDirectPrismaAllowed(rel)) continue
    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]
        if (directPrismaImportRegex.test(line)) {
            findings.push({
                file: rel,
                line: i + 1,
                text: line.trim(),
                message: 'direct prisma import outside repository boundary',
            })
        }
        directPrismaImportRegex.lastIndex = 0
    }
}

console.log(`\nArchitecture Boundary Audit (${strictMode ? 'strict' : 'report-only'})`)
if (findings.length === 0) {
    console.log('No boundary violations detected.')
    process.exit(0)
}

console.log(`Detected ${findings.length} violation(s):`)
for (const finding of findings) {
    if (finding.message) {
        console.log(`- ${finding.file}:L${finding.line} ${finding.message} | ${finding.text}`)
    } else {
        console.log(`- ${finding.file}:L${finding.line} ${finding.text}`)
    }
}

if (strictMode) {
    if (Number.isFinite(maxFindings) && maxFindings >= 0) {
        console.log(`Max allowed violations: ${maxFindings}`)
        process.exit(findings.length > maxFindings ? 1 : 0)
    }
    process.exit(1)
}

process.exit(0)
