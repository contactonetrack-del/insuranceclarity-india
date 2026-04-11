#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const strictMode = process.argv.includes('--strict')
const maxFindings = Number.parseInt(process.env.I18N_AUDIT_MAX_FINDINGS ?? '-1', 10)

const scopedPaths = [
    'src/app',
    'src/components',
    'src/features',
]

const fileExtensions = new Set(['.ts', '.tsx'])
const ignorePathRegexes = [
    /\/__tests__\//,
    /\.test\./,
    /\.spec\./,
    /\/node_modules\//,
    /\/\.next\//,
    /^src\/app\/api\//,
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

function collectFiles() {
    const files = []
    for (const target of scopedPaths) walk(target, files)
    return files
}

function collectFindings(content, filePath) {
    const findings = []
    const lines = content.split(/\r?\n/)
    const isTsx = filePath.endsWith('.tsx')
    const jsxTextRegex = /<[^>]+>\s*([A-Za-z][^<{]{2,})\s*<\/[^>]+>/g
    const titleLikeRegex = /(?:title|subtitle|label|placeholder|description)\s*:\s*['"`]([A-Za-z][^'"`]{2,})['"`]/g

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]
        if (line.includes('t(') || line.includes('useTranslations(')) continue

        let match
        if (isTsx && /<[/A-Za-z]/.test(line)) {
            while ((match = jsxTextRegex.exec(line)) !== null) {
                findings.push({ line: i + 1, kind: 'hardcoded-jsx-text', sample: match[1].trim() })
            }
        }

        while ((match = titleLikeRegex.exec(line)) !== null) {
            findings.push({ line: i + 1, kind: 'hardcoded-copy-prop', sample: match[1].trim() })
        }
    }
    return findings
}

const files = collectFiles()
const report = []
for (const file of files) {
    const rel = toPosix(path.relative(repoRoot, file))
    if (shouldIgnore(rel)) continue
    const content = fs.readFileSync(file, 'utf8')
    const findings = collectFindings(content, rel)
    if (findings.length > 0) report.push({ file: rel, findings })
}

console.log(`\ni18n Audit (${strictMode ? 'strict' : 'non-blocking'})`)
console.log('Scope:')
for (const scopedPath of scopedPaths) console.log(`- ${scopedPath}`)

if (report.length === 0) {
    console.log('\nNo hardcoded user-facing copy detected in scoped paths.')
    process.exit(0)
}

console.log('\nDetected potential i18n drift:')
for (const entry of report) {
    console.log(`\n${entry.file}`)
    for (const finding of entry.findings.slice(0, 20)) {
        console.log(`  L${finding.line} [${finding.kind}] ${finding.sample}`)
    }
    if (entry.findings.length > 20) {
        console.log(`  ... ${entry.findings.length - 20} more finding(s)`)
    }
}

if (strictMode) {
    const findingCount = report.reduce((acc, entry) => acc + entry.findings.length, 0)
    if (Number.isFinite(maxFindings) && maxFindings >= 0) {
        console.log(`\ni18n finding count: ${findingCount} (max allowed: ${maxFindings})`)
        if (findingCount > maxFindings) {
            console.log('\ni18n audit failed in strict mode.')
            process.exit(1)
        }
        console.log('\ni18n audit passed strict baseline gate.')
        process.exit(0)
    }

    console.log('\ni18n audit failed in strict mode.')
    process.exit(1)
}

console.log('\ni18n audit completed with warnings (non-blocking).')
process.exit(0)
