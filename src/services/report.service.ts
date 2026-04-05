/**
 * Report Service — Assembles, caches, and serves policy scan reports
 *
 * Responsibilities:
 * - Create and update Scan + Report records in PostgreSQL
 * - Cache results in Redis (TTL: 24h)
 * - Deduplication via file hash lookup
 * - Deliver paywall-gated responses (free vs. paid)
 */

import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import type { Prisma, ScanStatus as PrismaScanStatus } from '@prisma/client';
import type { AnalysisResult } from './ai.service';
import type {
    FreeReportResponse,
    FullReportResponse,
    ReportResponse,
    ScanStatus,
} from '@/types/report.types';

// ─── Cache ────────────────────────────────────────────────────────────────────

const REPORT_CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds
const STALE_SCAN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
type SupportedLocale = 'en' | 'hi';

function reportCacheKey(scanId: string): string {
    return `report:${scanId}`;
}

export interface ScanAccessScope {
    userId?: string | null;
    ipAddress?: string | null;
}

function scopeKey(scope: ScanAccessScope): string {
    if (scope.userId) return `u:${scope.userId}`;
    if (scope.ipAddress) return `ip:${scope.ipAddress}`;
    return 'unknown';
}

function hashCacheKey(fileHash: string, scope: ScanAccessScope): string {
    return `hash:${scopeKey(scope)}:${fileHash}`;
}

function buildAccessWhere(scope: ScanAccessScope): Prisma.ScanWhereInput {
    if (scope.userId) {
        return { userId: scope.userId };
    }

    if (scope.ipAddress) {
        return {
            userId: null,
            ipAddress: scope.ipAddress,
        };
    }

    // No ownership context means dedup must be skipped.
    return { id: '__no-access__' };
}

function isStaleStatus(status: PrismaScanStatus): boolean {
    return status === 'PENDING' || status === 'PROCESSING';
}

function normalizeLocale(locale?: string | null): SupportedLocale {
    return locale?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/**
 * Check if a file has already been scanned (by SHA-256 hash).
 * Returns the existing scanId if found.
 */
export async function findExistingScan(fileHash: string, scope: ScanAccessScope): Promise<string | null> {
    if (!scope.userId && !scope.ipAddress) {
        return null;
    }

    // Check Redis cache first
    const cached = await redisClient?.get<string>(hashCacheKey(fileHash, scope));
    if (cached) return cached;

    // Fall back to DB
    const existing = await prisma.scan.findFirst({
        where: {
            fileHash,
            status: 'COMPLETED',
            ...buildAccessWhere(scope),
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
    });

    if (existing) {
        // Cache for fast future lookups
        await redisClient?.set(hashCacheKey(fileHash, scope), existing.id, { ex: REPORT_CACHE_TTL });
        return existing.id;
    }

    return null;
}

export async function countAnonymousScansSince(ipAddress: string, since: Date): Promise<number> {
    return prisma.scan.count({
        where: {
            userId: null,
            ipAddress,
            createdAt: { gte: since },
        },
    });
}

// ─── Scan Record Management ───────────────────────────────────────────────────

export interface CreateScanInput {
    userId?: string;
    fileUrl: string;
    fileName: string;
    fileHash: string;
    fileSizeKb: number;
    ipAddress?: string;
}

/** Creates a new Scan record in PENDING state */
export async function createScan(input: CreateScanInput) {
    return prisma.scan.create({
        data: {
            userId:    input.userId ?? null,
            fileUrl:   input.fileUrl,
            fileName:  input.fileName,
            fileHash:  input.fileHash,
            fileSizeKb: input.fileSizeKb,
            ipAddress: input.ipAddress ?? null,
            status:    'PENDING',
        },
    });
}

/** Updates scan status */
export async function updateScanStatus(scanId: string, status: ScanStatus, score?: number) {
    return prisma.scan.update({
        where: { id: scanId },
        data: {
            status,
            score: score ?? undefined,
        },
    });
}

// ─── Report Persistence ───────────────────────────────────────────────────────

/** Saves GPT analysis result to DB and marks scan as COMPLETED */
export async function saveReport(scanId: string, result: AnalysisResult) {
    const { report, tokensUsed, processingMs } = result;

    await prisma.$transaction([
        // Save report
        prisma.report.create({
            data: {
                scanId,
                summary:      report.summary,
                score:        report.score,
                risks:        report.risks        as unknown as import('@prisma/client').Prisma.InputJsonValue,
                exclusions:   report.exclusions   as unknown as import('@prisma/client').Prisma.InputJsonValue,
                suggestions:  report.suggestions  as unknown as import('@prisma/client').Prisma.InputJsonValue,
                hiddenClauses: report.hiddenClauses as unknown as import('@prisma/client').Prisma.InputJsonValue,
                rawGptOutput: report.rawText ?? null,
                tokensUsed,
                processingMs,
            },
        }),
        // Mark scan as COMPLETED with score
        prisma.scan.update({
            where: { id: scanId },
            data: { status: 'COMPLETED', score: report.score },
        }),
    ]);

    logger.info({ action: 'report.saved', scanId, score: report.score });
}

/** Marks a scan as FAILED */
export async function markScanFailed(scanId: string) {
    await prisma.scan.update({
        where: { id: scanId },
        data: { status: 'FAILED' },
    });
    logger.warn({ action: 'report.failed', scanId });
}

// ─── Report Retrieval ─────────────────────────────────────────────────────────

export interface GetReportOptions {
    scanId: string;
    isPaid?: boolean;
    locale?: string | null;
}

/**
 * Get report for a scan, applying paywall gate.
 *
 * FREE:  Returns score + summary + top 3 risks (paywalled)
 * PAID:  Returns full report with all risks, exclusions, suggestions, hidden clauses
 */
export async function getReport(options: GetReportOptions): Promise<ReportResponse | null> {
    const { scanId } = options;

    // Check Redis cache
    const cacheKey = reportCacheKey(scanId);
    const cached = await redisClient?.get<string>(cacheKey);
    if (cached) {
        const full = JSON.parse(cached) as FullReportResponse;
        return applyPaywall(full, options.isPaid ?? false, options.locale);
    }

    // Load from DB
    const scan = await prisma.scan.findUnique({
        where: { id: scanId },
        include: { report: true },
    });

    if (!scan || !scan.report || scan.status !== 'COMPLETED') {
        return null;
    }

    const fullReport: FullReportResponse = {
        scanId:       scan.id,
        score:        scan.report.score,
        summary:      scan.report.summary,
        risks:        scan.report.risks        as unknown as FullReportResponse['risks'],
        exclusions:   scan.report.exclusions   as unknown as FullReportResponse['exclusions'],
        suggestions:  scan.report.suggestions  as unknown as FullReportResponse['suggestions'],
        hiddenClauses: scan.report.hiddenClauses as unknown as FullReportResponse['hiddenClauses'],
        isPaid:       true,
        paywall:      false,
        processingMs: scan.report.processingMs ?? undefined,
    };

    // Cache full report
    await redisClient?.set(cacheKey, JSON.stringify(fullReport), { ex: REPORT_CACHE_TTL });

    return applyPaywall(fullReport, options.isPaid ?? scan.isPaid, options.locale);
}

/** Gets current scan status (for polling) */
export async function getScanStatus(scanId: string) {
    const scan = await prisma.scan.findUnique({
        where: { id: scanId },
        select: { id: true, status: true, score: true, isPaid: true, updatedAt: true },
    });

    if (!scan) return null;

    const staleForMs = Date.now() - scan.updatedAt.getTime();
    if (isStaleStatus(scan.status) && staleForMs > STALE_SCAN_TIMEOUT_MS) {
        await prisma.scan.update({
            where: { id: scan.id },
            data: { status: 'FAILED' },
        });

        logger.warn({
            action: 'scan.stale.marked_failed',
            scanId: scan.id,
            staleForMs,
        });

        return {
            id: scan.id,
            status: 'FAILED' as ScanStatus,
            score: scan.score,
            isPaid: scan.isPaid,
        };
    }

    return {
        id: scan.id,
        status: scan.status as ScanStatus,
        score: scan.score,
        isPaid: scan.isPaid,
    };
}

// ─── Paywall Gate ─────────────────────────────────────────────────────────────

function applyPaywall(
    full: FullReportResponse,
    isPaid: boolean,
    locale?: string | null,
): ReportResponse {
    if (isPaid) {
        return { ...full, isPaid: true, paywall: false };
    }

    const currentLocale = normalizeLocale(locale);
    const exclusionsCount = full.exclusions.length;
    const suggestionsCount = full.suggestions.length;
    const hiddenClausesCount = full.hiddenClauses.length;
    const paywallMessage = currentLocale === 'hi'
        ? `पूरी रिपोर्ट अनलॉक करें: ${exclusionsCount} एक्सक्लूजन, ${suggestionsCount} सुझाव और ${hiddenClausesCount} छिपे हुए क्लॉज सिर्फ ₹199 में देखें।`
        : `Unlock the full report to see ${exclusionsCount} exclusions, ${suggestionsCount} suggestions, and ${hiddenClausesCount} hidden clauses for just ₹199.`;

    // Free tier: only top 3 risks visible, rest locked
    const freeReport: FreeReportResponse = {
        scanId:         full.scanId,
        score:          full.score,
        summary:        full.summary,
        risks:          full.risks.slice(0, 3),
        isPaid:         false,
        paywall:        true,
        paywallMessage,
        exclusionsCount,
        suggestionsCount,
        hiddenClausesCount,
    };

    return freeReport;
}

