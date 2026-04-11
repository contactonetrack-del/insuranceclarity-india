#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const strictMode = process.argv.includes('--strict')
const maxFindings = Number.parseInt(process.env.I18N_LOCALE_MAX_FINDINGS ?? '0', 10)

const englishPath = path.join(repoRoot, 'messages', 'en.json')
const hindiPath = path.join(repoRoot, 'messages', 'hi.json')

const englishOnlyRegex = /[A-Za-z]/
const devanagariRegex = /[\u0900-\u097F]/
const placeholderRegex = /\{([^{}]+)\}/g
const repeatedQuestionMarkRegex = /\?{2,}/
const wrappedQuestionMarkRegex = /\?[^\r\n?]{1,80}\?/
const replacementCharacterRegex = /\uFFFD/

const allowedTerms = [
    'InsuranceClarity',
    'IRDAI',
    'API',
    'OTP',
    'PDF',
    'CRM',
    'AI',
    'Razorpay',
    'Google',
    'Twitter',
    'LinkedIn',
    'Instagram',
    'Bima Bharosa',
    'Vercel',
    'Postgres',
    'Redis',
    'Next.js',
    'WhatsApp',
    'USD',
    'Rs',
    'Ã¢â€šÂ¹',
]

function flattenStrings(value, prefix = '', out = {}) {
    if (typeof value === 'string') {
        out[prefix] = value
        return out
    }

    if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index += 1) {
            flattenStrings(value[index], `${prefix}[${index}]`, out)
        }
        return out
    }

    if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
            const nextPrefix = prefix ? `${prefix}.${key}` : key
            flattenStrings(child, nextPrefix, out)
        }
    }

    return out
}

function hasAllowedEnglishToken(text) {
    if (
        text.includes('@') ||
        text.includes('http://') ||
        text.includes('https://') ||
        text.includes('.in') ||
        text.includes('.com')
    ) {
        return true
    }

    const placeholderStripped = text.replace(placeholderRegex, '').trim()
    placeholderRegex.lastIndex = 0
    if (
        placeholderStripped.length === 0 ||
        /^[\s\d()[\].,:/|+\-_%$₹]+$/.test(placeholderStripped)
    ) {
        return true
    }

    if (/^[\s\d{}()[\].,:/|+\-_%$Ã¢â€šÂ¹]+$/.test(text)) {
        return true
    }

    const trimmed = text.trim()
    if (trimmed.length <= 4 && /[A-Z]/.test(trimmed) && trimmed.toUpperCase() === trimmed) {
        return true
    }

    return allowedTerms.some((token) => text.includes(token))
}

function extractPlaceholderSet(text) {
    if (text.includes('plural,')) {
        return new Set()
    }

    const set = new Set()
    let match
    while ((match = placeholderRegex.exec(text)) !== null) {
        set.add(match[1])
    }
    placeholderRegex.lastIndex = 0
    return set
}

function diffSets(a, b) {
    if (a.size !== b.size) return true
    for (const item of a) {
        if (!b.has(item)) return true
    }
    return false
}

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const englishMessages = loadJson(englishPath)
const hindiMessages = loadJson(hindiPath)

const englishFlat = flattenStrings(englishMessages)
const hindiFlat = flattenStrings(hindiMessages)

const missingHindiKeys = Object.keys(englishFlat).filter((key) => !(key in hindiFlat))
const missingEnglishKeys = Object.keys(hindiFlat).filter((key) => !(key in englishFlat))

const englishOnlyRaw = []
const likelyUntranslated = []
const sameAsEnglishRaw = []
const placeholderMismatches = []
const suspectedCorruption = []

for (const [key, value] of Object.entries(hindiFlat)) {
    if (typeof value !== 'string') continue

    if (englishFlat[key] === value) {
        sameAsEnglishRaw.push({key, value})
    }

    if (
        repeatedQuestionMarkRegex.test(value) ||
        wrappedQuestionMarkRegex.test(value) ||
        replacementCharacterRegex.test(value)
    ) {
        suspectedCorruption.push({key, value})
    }

    const hasEnglish = englishOnlyRegex.test(value)
    const hasHindi = devanagariRegex.test(value)
    if (hasEnglish && !hasHindi) {
        englishOnlyRaw.push({key, value})
        if (!hasAllowedEnglishToken(value)) {
            likelyUntranslated.push({key, value})
        }
    }

    const englishValue = englishFlat[key]
    if (typeof englishValue === 'string') {
        const enPlaceholders = extractPlaceholderSet(englishValue)
        const hiPlaceholders = extractPlaceholderSet(value)
        if (diffSets(enPlaceholders, hiPlaceholders)) {
            placeholderMismatches.push({
                key,
                english: englishValue,
                hindi: value,
                englishPlaceholders: [...enPlaceholders],
                hindiPlaceholders: [...hiPlaceholders],
            })
        }
    }
}

console.log(`\ni18n Locale Quality Audit (${strictMode ? 'strict' : 'non-blocking'})`)
console.log(`- locale file: messages/hi.json`)
console.log(`- total keys: ${Object.keys(hindiFlat).length}`)
console.log(`- english-only raw values: ${englishOnlyRaw.length}`)
console.log(`- same-as-en raw values: ${sameAsEnglishRaw.length}`)
console.log(`- likely untranslated values: ${likelyUntranslated.length}`)
console.log(`- placeholder mismatches: ${placeholderMismatches.length}`)
console.log(`- suspected corruption values: ${suspectedCorruption.length}`)
console.log(`- missing keys (hi<-en): ${missingHindiKeys.length}`)
console.log(`- extra keys (hi->en): ${missingEnglishKeys.length}`)

if (suspectedCorruption.length > 0) {
    console.log('\nSuspected corruption values (top 25):')
    for (const finding of suspectedCorruption.slice(0, 25)) {
        console.log(`- ${finding.key}: ${finding.value}`)
    }
}

if (likelyUntranslated.length > 0) {
    console.log('\nLikely untranslated values (top 25):')
    for (const finding of likelyUntranslated.slice(0, 25)) {
        console.log(`- ${finding.key}: ${finding.value}`)
    }
}

if (placeholderMismatches.length > 0) {
    console.log('\nPlaceholder mismatches:')
    for (const finding of placeholderMismatches.slice(0, 25)) {
        console.log(`- ${finding.key}`)
        console.log(`  en: [${finding.englishPlaceholders.join(', ')}]`)
        console.log(`  hi: [${finding.hindiPlaceholders.join(', ')}]`)
    }
}

if (missingHindiKeys.length > 0) {
    console.log('\nMissing hi keys (top 25):')
    for (const key of missingHindiKeys.slice(0, 25)) {
        console.log(`- ${key}`)
    }
}

if (missingEnglishKeys.length > 0) {
    console.log('\nExtra hi keys (top 25):')
    for (const key of missingEnglishKeys.slice(0, 25)) {
        console.log(`- ${key}`)
    }
}

const findingKeys = new Set([
    ...likelyUntranslated.map((finding) => finding.key),
    ...placeholderMismatches.map((finding) => finding.key),
    ...suspectedCorruption.map((finding) => finding.key),
])
const findingCount = findingKeys.size

if (!strictMode) {
    if (findingCount === 0) {
        console.log('\nLocale quality audit passed.')
    } else {
        console.log('\nLocale quality audit completed with warnings.')
    }
    process.exit(0)
}

console.log(`\nLocale quality finding count: ${findingCount} (max allowed: ${maxFindings})`)
if (findingCount > maxFindings) {
    console.log('\nLocale quality audit failed in strict mode.')
    process.exit(1)
}

console.log('\nLocale quality audit passed strict baseline gate.')
process.exit(0)
