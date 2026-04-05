/**
 * Scan Processing Pipeline
 *
 * Core scan-analysis processor used by both:
 * - managed worker jobs (QStash -> /api/jobs/document-worker)
 * - inline/local fallback execution when queue dispatch is unavailable
 */

import { logger } from '@/lib/logger';
import { chunkText, selectRepresentativeChunks } from '@/services/pdf.service';
import { extractTextFromPdf } from '@/services/pdf-extraction.server';
import { analyzePolicyWithGpt, type AnalysisResult } from '@/services/ai.service';
import {
    saveReport,
    markScanFailed,
    updateScanStatus,
} from '@/services/report.service';
import { sendScanCompleteEmail } from '@/services/email.service';
import { prisma } from '@/lib/prisma';
import { getCachedAnalysis, cacheAnalysis } from '@/lib/cache/report-cache';

const ANALYSIS_TIMEOUT_MS = 55_000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    let timeoutId: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(timeoutMessage));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

// ─── Job Payload ──────────────────────────────────────────────────────────────

export interface ScanJobPayload {
    scanId:   string;
    pdfText:  string;
    fileName: string;
    fileHash?: string;
    userId?:  string;
    locale?:  'en' | 'hi';
}

// Keep backward-compat type alias
export type ScanJobData = ScanJobPayload;

// ─── Core Processor ───────────────────────────────────────────────────────────

/**
 * Process a scan inline (synchronously in the current runtime).
 * Used as fallback path for resilience.
 */
export async function processScanInline(payload: ScanJobPayload): Promise<void> {
    const { scanId, pdfText, fileName, fileHash, userId, locale } = payload;
    const startMs = Date.now();

    logger.info({ action: 'scan.process.start', scanId, fileName });

    try {
        // 1. Mark as PROCESSING so the result page shows "analyzing..."
        await updateScanStatus(scanId, 'PROCESSING');

        // 2. Chunk the extracted text and select representative sections
        //    This keeps the prompt within GPT token limits
        const chunks   = chunkText(pdfText);
        const selected = selectRepresentativeChunks(chunks);

        if (selected.length === 0) {
            throw new Error(
                'Could not extract meaningful text from this PDF. ' +
                'It may be image-based, scanned, or password-protected. ' +
                'Please try a text-based PDF.',
            );
        }

        // 3. Send to AI for analysis (with report caching)
        let result: AnalysisResult | undefined;

        if (fileHash) {
            const cachedResult = await getCachedAnalysis<AnalysisResult>(fileHash);
            if (cachedResult) {
                result = cachedResult;
                logger.info({ action: 'scan.cache.hit', scanId, fileHash });
            }
        }

        if (!result) {
            result = await withTimeout(
                analyzePolicyWithGpt({
                    policyText: selected.join('\n\n---\n\n'),
                    fileName,
                }),
                ANALYSIS_TIMEOUT_MS,
                'AI analysis timed out before completion. Please retry this scan.',
            );

            if (fileHash) {
                await cacheAnalysis(fileHash, result);
            }
        }

        if (!result) {
            throw new Error('Analysis failed to generate a result.');
        }

        // 4. Persist the report + update scan status → COMPLETED (atomic transaction)
        await saveReport(scanId, result);

        // 5. Increment scansUsed counter for the authenticated user
        //    This activates the plan limit enforcement on their next upload
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data:  { scansUsed: { increment: 1 } },
            }).catch((err: unknown) => {
                // Non-fatal — log and continue
                logger.warn({
                    action: 'scan.scansUsed.increment.failed',
                    userId,
                    error: String(err),
                });
            });
        }

        // 6. Send scan-complete notification email (fire & forget — non-blocking)
        if (userId) {
            const user = await prisma.user.findUnique({
                where:  { id: userId },
                select: { email: true, name: true },
            });
            if (user?.email) {
                sendScanCompleteEmail(user.email, {
                    userName: user.name ?? 'there',
                    scanId,
                    fileName,
                    score: result.report.score,
                    locale,
                }).catch((err: unknown) => {
                    logger.warn({ action: 'scan.email.failed', scanId, error: String(err) });
                });
            }
        }

        // 7. Send notification emails requested from the processing screen (anonymous or logged-in)
        const notifyLeads = await prisma.lead.findMany({
            where: {
                insuranceType: 'SCAN_NOTIFY',
                notes: `scan:${scanId}`,
                status: 'NEW',
            },
            select: {
                id: true,
                email: true,
                name: true,
                source: true,
            },
        });

        if (notifyLeads.length > 0) {
            await Promise.all(
                notifyLeads.map(async (lead) => {
                    const leadLocale = lead.source.endsWith('_hi') ? 'hi' : locale;
                    const sent = await sendScanCompleteEmail(lead.email, {
                        userName: lead.name || 'there',
                        scanId,
                        fileName,
                        score: result.report.score,
                        locale: leadLocale,
                    });

                    if (sent) {
                        await prisma.lead.update({
                            where: { id: lead.id },
                            data: { status: 'CONTACTED' },
                        });
                    }
                }),
            );
        }

        const processingMs = Date.now() - startMs;
        logger.info({
            action: 'scan.process.complete',
            scanId,
            processingMs,
            score: result.report.score,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'scan.process.failed', scanId, error: message });

        // Mark scan as FAILED so UI can surface a useful error state
        await markScanFailed(scanId).catch(() => { /* ignore double-fail */ });

        throw error;
    }
}

export async function processScanFromStoredFile(payload: {
    scanId: string;
    fileName?: string;
    fileHash?: string;
    userId?: string;
    locale?: 'en' | 'hi';
}): Promise<void> {
    const scan = await prisma.scan.findUnique({
        where: { id: payload.scanId },
        select: {
            id: true,
            fileUrl: true,
            fileName: true,
            fileHash: true,
            userId: true,
            status: true,
        },
    });

    if (!scan) {
        throw new Error(`Scan not found for worker payload: ${payload.scanId}`);
    }

    const response = await fetch(scan.fileUrl);
    if (!response.ok) {
        throw new Error(`Unable to fetch PDF source for scan ${scan.id}.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extracted = await extractTextFromPdf(buffer);

    await processScanInline({
        scanId: scan.id,
        pdfText: extracted.text,
        fileName: payload.fileName ?? scan.fileName,
        fileHash: scan.fileHash ?? undefined,
        userId: payload.userId ?? scan.userId ?? undefined,
        locale: payload.locale,
    });
}

/**
 * Enqueue a scan job.
 *
 * The function is non-blocking from the HTTP response perspective.
 * The caller fires this without awaiting it so the HTTP response goes out immediately,
 * and the client polls /api/result/[id]?status=true to check completion.
 */
export function enqueueScanJob(payload: ScanJobPayload): Promise<void> {
    return processScanInline(payload);
}
