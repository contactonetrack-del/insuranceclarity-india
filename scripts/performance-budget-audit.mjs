#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const strict = process.argv.includes('--strict');
const root = process.cwd();
const chunksDir = path.join(root, '.next', 'static', 'chunks');

function fail(message) {
    console.error(message);
    process.exit(1);
}

function listJsFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...listJsFiles(fullPath));
            continue;
        }
        if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

function kb(bytes) {
    return bytes / 1024;
}

if (!fs.existsSync(chunksDir)) {
    fail(`[FAIL] performance-audit: missing ${path.relative(root, chunksDir)}. Run npm run build first.`);
}

const maxTotalGzipKb = Number(
    process.env.PERF_MAX_TOTAL_GZIP_KB ?? (strict ? 3000 : 3400),
);
const maxLargestGzipKb = Number(
    process.env.PERF_MAX_LARGEST_GZIP_KB ?? (strict ? 800 : 900),
);
const maxChunkCount = Number(
    process.env.PERF_MAX_CHUNK_COUNT ?? (strict ? 220 : 260),
);

const jsFiles = listJsFiles(chunksDir);
if (jsFiles.length === 0) {
    fail('[FAIL] performance-audit: no .js chunks found in .next/static/chunks');
}

const stats = jsFiles.map((filePath) => {
    const source = fs.readFileSync(filePath);
    const gzipBytes = zlib.gzipSync(source, { level: zlib.constants.Z_BEST_COMPRESSION }).length;
    return {
        filePath,
        rawBytes: source.length,
        gzipBytes,
    };
});

const totals = stats.reduce(
    (acc, item) => {
        acc.rawBytes += item.rawBytes;
        acc.gzipBytes += item.gzipBytes;
        return acc;
    },
    { rawBytes: 0, gzipBytes: 0 },
);

const largest = [...stats].sort((a, b) => b.gzipBytes - a.gzipBytes)[0];
const relativeLargest = path.relative(root, largest.filePath).replaceAll('\\', '/');

const findings = [];
if (kb(totals.gzipBytes) > maxTotalGzipKb) {
    findings.push(
        `[budget-total] gzip total ${kb(totals.gzipBytes).toFixed(1)}KB exceeds ${maxTotalGzipKb}KB`,
    );
}
if (kb(largest.gzipBytes) > maxLargestGzipKb) {
    findings.push(
        `[budget-largest] largest gzip chunk ${kb(largest.gzipBytes).toFixed(1)}KB (${relativeLargest}) exceeds ${maxLargestGzipKb}KB`,
    );
}
if (stats.length > maxChunkCount) {
    findings.push(`[budget-count] chunk count ${stats.length} exceeds ${maxChunkCount}`);
}

if (findings.length > 0) {
    console.error('\nPerformance Budget Audit');
    console.error(`Mode: ${strict ? 'strict' : 'standard'}`);
    console.error(`Chunks: ${stats.length}`);
    console.error(`Total JS raw: ${kb(totals.rawBytes).toFixed(1)}KB`);
    console.error(`Total JS gzip: ${kb(totals.gzipBytes).toFixed(1)}KB`);
    console.error(`Largest JS gzip: ${kb(largest.gzipBytes).toFixed(1)}KB (${relativeLargest})`);
    for (const finding of findings) {
        console.error(`[FAIL] ${finding}`);
    }
    process.exit(1);
}

console.log('\nPerformance Budget Audit');
console.log(`Mode: ${strict ? 'strict' : 'standard'}`);
console.log(`Chunks: ${stats.length}`);
console.log(`Total JS raw: ${kb(totals.rawBytes).toFixed(1)}KB`);
console.log(`Total JS gzip: ${kb(totals.gzipBytes).toFixed(1)}KB`);
console.log(`Largest JS gzip: ${kb(largest.gzipBytes).toFixed(1)}KB (${relativeLargest})`);
console.log('[PASS] performance-audit: budgets satisfied');
