/**
 * POST /api/jobs/document-worker
 *
 * Receives background scan-analysis jobs dispatched by the upload flow.
 * Supports two queue providers:
 *   - qstash  : Upstash QStash managed queue (HMAC-verified, at-least-once)
 *   - http    : Direct internal dispatch (fallback / local dev)
 *
 * Security model:
 *   - QStash requests: verified via HMAC signature using signing keys
 *   - HTTP requests:   verified via constant-time X-Queue-Secret comparison
 *   - Public access is blocked — this route is only callable by the queue
 *
 * Vercel function timeout: 60s (matches vercel.json `document-worker` config)
 */

import { NextResponse } from 'next/server';
import { getQueueSecret, verifyQstashRequestSignature } from '@/lib/queue/config';

export const dynamic    = 'force-dynamic';
export const maxDuration = 60; // seconds — must match vercel.json

// ─── Types ────────────────────────────────────────────────────────────────────

type JobNames = 'GENERATE_QUOTE_DOCUMENT' | 'PROCESS_SCAN_ANALYSIS';

type JobPayload = {
    quoteId?:  string;
    scanId?:   string;
    fileName?: string;
    userId?:   string;
    locale?:   'en' | 'hi';
};

type WorkerLogger = {
    debug : (arg: unknown, message?: string) => void;
    info  : (arg: unknown, message?: string) => void;
    warn  : (arg: unknown, message?: string) => void;
    error : (arg: unknown, message?: string) => void;
};

type WorkerEnvelope = {
    jobId:        string;
    jobName:      JobNames;
    payload:      JobPayload;
    attempt?:     number;
    maxAttempts?: number;
    provider?:    'qstash' | 'http';
};

// ─── Constant-time comparison ─────────────────────────────────────────────────
// Simple `===` leaks timing information: JS short-circuits on the first mismatch,
// allowing an attacker to determine how many leading characters matched.
// XOR-based comparison always runs through the full string.
function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

// ─── Authentication ───────────────────────────────────────────────────────────

async function authenticateWorkerRequest(
    logger: WorkerLogger,
    request: Request,
    rawBody: string,
): Promise<boolean> {
    let expectedSecret: string;
    try {
        expectedSecret = getQueueSecret();
    } catch (error) {
        logger.error({
            action : 'workerUnauthorized',
            reason : 'queue_secret_not_configured',
            error  : error instanceof Error ? error.message : String(error),
        });
        return false;
    }

    const requestSecret    = request.headers.get('x-queue-secret') ?? '';
    const qstashSignature  = request.headers.get('upstash-signature');

    // ── HTTP fallback path (no QStash signature) ──────────────────────────────
    if (!qstashSignature) {
        const valid = constantTimeEqual(requestSecret, expectedSecret);
        if (!valid) {
            logger.error({ action: 'workerUnauthorized', reason: 'invalid_http_secret' });
        }
        return valid;
    }

    // ── QStash managed-queue path ─────────────────────────────────────────────
    try {
        const isValid = await verifyQstashRequestSignature(rawBody, qstashSignature);
        if (!isValid) {
            logger.error({ action: 'workerUnauthorized', reason: 'invalid_qstash_signature' });
            return false;
        }

        // Defense-in-depth: also require the forwarded queue secret header.
        // This ensures only dispatches from our own upload code are accepted.
        if (!constantTimeEqual(requestSecret, expectedSecret)) {
            logger.error({ action: 'workerUnauthorized', reason: 'missing_forwarded_queue_secret' });
            return false;
        }

        return true;
    } catch (error) {
        logger.error({
            action : 'workerUnauthorized',
            reason : 'qstash_signature_verification_error',
            error  : error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * All heavy processing modules are lazily imported to avoid Turbopack
 * evaluating their module graphs (e.g., pdf-parse native bindings) at build time.
 */
export async function POST(request: Request) {
    const { logger, logSecurityEvent } = await import('@/lib/logger');

    const rawBody = await request.text();

    // 1. Authenticate the incoming queue invocation
    const isAuthorized = await authenticateWorkerRequest(logger, request, rawBody);
    if (!isAuthorized) {
        logSecurityEvent('worker.auth.rejected', 'high', {
            ip       : request.headers.get('x-forwarded-for') ?? 'unknown',
            provider : request.headers.get('x-queue-provider') ?? 'unknown',
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Track scanId early so we can mark it FAILED if anything throws
    let scanIdForFailover: string | undefined;

    try {
        const body = JSON.parse(rawBody) as Partial<WorkerEnvelope>;
        const { jobId, jobName, payload, attempt, maxAttempts, provider } = body;

        if (!jobId || !jobName || !payload) {
            return NextResponse.json({ error: 'Invalid job envelope — missing required fields' }, { status: 400 });
        }

        scanIdForFailover = payload.scanId;

        logger.info({
            action      : 'workerStarted',
            jobName,
            jobId,
            provider    : provider ?? 'unknown',
            attempt     : attempt ?? 1,
            maxAttempts : maxAttempts ?? 1,
        }, `Worker processing ${jobName} job ${jobId}`);

        // 2. Route to the correct handler
        switch (jobName) {
            case 'PROCESS_SCAN_ANALYSIS':
                await processScanAnalysis(payload, logger);
                break;

            case 'GENERATE_QUOTE_DOCUMENT':
                await processQuoteDocument(payload, logger);
                break;

            default: {
                logger.warn({ action: 'workerUnknownJob', jobName, jobId });
                return NextResponse.json({ error: `Unknown job: ${String(jobName)}` }, { status: 400 });
            }
        }

        logger.info({
            action      : 'workerCompleted',
            jobName,
            jobId,
            provider    : provider ?? 'unknown',
            attempt     : attempt ?? 1,
            maxAttempts : maxAttempts ?? 1,
        }, `Worker completed ${jobName} job ${jobId}`);

        return NextResponse.json({ success: true, jobId });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'workerFatalError', error: message }, 'Worker execution failed');

        // Mark the scan as FAILED so users see a recoverable error (not an infinite spinner).
        // Returning 500 signals QStash to retry the job per its configured retry policy.
        if (scanIdForFailover) {
            try {
                const { markScanFailed } = await import('@/services/report.service');
                await markScanFailed(scanIdForFailover);
            } catch { /* non-fatal — best effort */ }
        }

        return NextResponse.json({ error: 'Worker Failed' }, { status: 500 });
    }
}

// ─── Job Handlers ─────────────────────────────────────────────────────────────

async function processScanAnalysis(payload: JobPayload, logger: WorkerLogger): Promise<void> {
    if (!payload.scanId) {
        throw new Error('PROCESS_SCAN_ANALYSIS: missing scanId in payload');
    }

    logger.info({ action: 'scanWorker.started', scanId: payload.scanId });

    const { processScanFromStoredFile } = await import('@/lib/queue/scan-queue');
    await processScanFromStoredFile({
        scanId   : payload.scanId,
        fileName : payload.fileName,
        userId   : payload.userId,
        locale   : payload.locale,
    });

    logger.info({ action: 'scanWorker.completed', scanId: payload.scanId });
}

async function processQuoteDocument(payload: JobPayload, logger: WorkerLogger): Promise<void> {
    if (!payload.quoteId) {
        throw new Error('GENERATE_QUOTE_DOCUMENT: missing quoteId in payload');
    }

    logger.info({ action: 'quoteDocWorker.started', quoteId: payload.quoteId });

    const { quoteRepository } = await import('@/repositories/quote.repository');
    await quoteRepository.update(payload.quoteId, { status: 'READY' });

    logger.info({ action: 'quoteDocWorker.completed', quoteId: payload.quoteId });
}
