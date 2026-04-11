#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

const scopedPaths = [
    'src/app/globals.css',
    'src/app',
    'src/components',
    'src/features',
    'src/config/navigation.ts',
    'src/config/home-data.ts',
    'src/lib/theme/tone.ts',
]

const fileExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css'])

const ignorePathRegexes = [
    /\/__tests__\//,
    /\.test\./,
    /\.spec\./,
    /\/node_modules\//,
    /\/\.next\//,
    /^src\/app\/api\//,
]

const checks = [
    {
        id: 'legacy-accent-utility',
        description: 'Legacy accent utility alias (prefer tokenized slash opacity or tone contract)',
        regex: /\b(?:bg|border|text|ring)-accent-(?:5|10|20)\b/g,
    },
    {
        id: 'raw-brand-palette-class',
        description: 'Raw brand palette utility (blue/indigo/cyan/emerald/green)',
        regex: /\b(?:text|bg|border|ring|from|to|via)-(?:blue|indigo|cyan|emerald|green)-\d{2,3}\b/g,
    },
    {
        id: 'raw-palette-gradient-fragment',
        description: 'Raw palette gradient fragment',
        regex: /\b(?:from|to|via)-(?:blue|indigo|cyan|emerald|green|purple|violet)-\d{2,3}(?:\/\d{1,3})?\b/g,
    },
    {
        id: 'hardcoded-brand-hex',
        description: 'Hardcoded hex color',
        regex: /#[0-9a-fA-F]{3,8}\b/g,
    },
    {
        id: 'hardcoded-brand-rgb',
        description: 'Hardcoded rgb/rgba color',
        regex: /\brgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:\d+|\d*\.\d+))?\s*\)/g,
    },
]

function walk(targetPath, acc) {
    const absolute = path.join(repoRoot, targetPath)
    if (!fs.existsSync(absolute)) {
        return
    }

    const stat = fs.statSync(absolute)
    if (stat.isFile()) {
        if (fileExtensions.has(path.extname(absolute))) {
            acc.push(absolute)
        }
        return
    }

    for (const entry of fs.readdirSync(absolute)) {
        walk(path.join(targetPath, entry), acc)
    }
}

function toPosix(p) {
    return p.split(path.sep).join('/')
}

function relativeFilePath(absolutePath) {
    return toPosix(path.relative(repoRoot, absolutePath))
}

function shouldIgnore(filePath) {
    return ignorePathRegexes.some((rx) => rx.test(filePath))
}

function collectFiles() {
    const files = []
    for (const target of scopedPaths) {
        walk(target, files)
    }
    return files
}

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split(/\r?\n/)
    const findings = []
    const isGlobalTokenFile = filePath.endsWith(path.join('src', 'app', 'globals.css'))

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]
        for (const check of checks) {
            if (
                isGlobalTokenFile &&
                (check.id === 'hardcoded-brand-hex' || check.id === 'hardcoded-brand-rgb') &&
                /--token-|--footer-/.test(line)
            ) {
                continue
            }
            const matches = line.match(check.regex)
            if (!matches) {
                continue
            }
            findings.push({
                line: i + 1,
                checkId: check.id,
                description: check.description,
                matches: [...new Set(matches)].join(', '),
            })
        }
    }

    return findings
}

const files = collectFiles()
const report = []
const strictMode = process.argv.includes('--strict')
const maxFindings = Number.parseInt(process.env.THEME_AUDIT_MAX_FINDINGS ?? '-1', 10)

for (const absoluteFilePath of files) {
    const rel = relativeFilePath(absoluteFilePath)
    if (shouldIgnore(rel)) {
        continue
    }
    const findings = auditFile(absoluteFilePath)
    if (findings.length > 0) {
        report.push({ file: rel, findings })
    }
}

console.log(`\nTheme Audit (${strictMode ? 'strict' : 'non-blocking'})`)
console.log('Scope:')
for (const scopedPath of scopedPaths) {
    console.log(`- ${scopedPath}`)
}
console.log('\nAllowed exceptions:')
console.log('- semantic states')
console.log('- charts/data-vis')
console.log('- api/pdf non-theme rendering surfaces')
console.log('- tests')
console.log('- third-party code')
console.log('- isolated legacy surfaces outside scope')

if (report.length === 0) {
    console.log('\nNo scoped theme drift patterns detected.')
    process.exit(0)
}

console.log('\nDetected potential drift:')
for (const entry of report) {
    console.log(`\n${entry.file}`)
    for (const finding of entry.findings) {
        console.log(`  L${finding.line} [${finding.checkId}] ${finding.matches}`)
    }
}

if (strictMode) {
    const findingCount = report.reduce((acc, entry) => acc + entry.findings.length, 0)
    if (Number.isFinite(maxFindings) && maxFindings >= 0) {
        console.log(`\nTheme finding count: ${findingCount} (max allowed: ${maxFindings})`)
        if (findingCount > maxFindings) {
            console.log('\nTheme audit failed in strict mode.')
            process.exit(1)
        }
        console.log('\nTheme audit passed strict baseline gate.')
        process.exit(0)
    }

    console.log('\nTheme audit failed in strict mode.')
    process.exit(1)
}

console.log('\nTheme audit completed with warnings (non-blocking).')
process.exit(0)
