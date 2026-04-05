import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/cache/redis';
import { verifyQstashRequestSignature } from '@/lib/queue/config';
import { markScanFailed } from '@/services/report.service';

export const dynamic    = 'force-dynamic';
export const maxDuration = 30;

const DEAD_LETTER_TTL_SECONDS = 60 * 60 * 24 * 7;

type JobNames = 'GENERATE_QUOTE_DOCUMENT' | 'PROCESS_SCAN_ANALYSIS';

type WorkerEnvelope = {
    jobId?: string;
    jobName?: JobNames;
    payload?: {
        scanId?: string;
        quoteId?: string;
        fileName?: string;
        userId?: string;
        locale?: 'en' | 'hi';
    };
};

function parseEnvelopeFromFailureBody(raw: string): WorkerEnvelope | null {
    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const direct = parsed as WorkerEnvelope;
        if (direct.jobId || direct.jobName || direct.payload) {
            return direct;
        }

        const nestedBody = parsed.body;
        if (typeof nestedBody === 'string') {
            return JSON.parse(nestedBody) as WorkerEnvelope;
        }

        if (nestedBody && typeof nestedBody === 'object') {
            return nestedBody as WorkerEnvelope;
        }

        return null;
    } catch {
        return null;
    }
}

async function recordDeadLetter(entry: {
    deadLetterId: string;
    jobId?: string;
    jobName?: string;
    scanId?: string;
    quoteId?: string;
    reason: string;
    rawFailureBody: string;
}) {
    if (redisClient.isConfigured()) {
        await redisClient.set(`queue:dead-letter:${entry.deadLetterId}`, entry, {
            ex: DEAD_LETTER_TTL_SECONDS,
        });
    }
}

export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get('upstash-signature');

    if (!signature) {
        logger.error({ action: 'queue.failure.unauthorized', reason: 'missing_signature' });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValidSignature = await verifyQstashRequestSignature(rawBody, signature).catch((error) => {
        logger.error({
            action: 'queue.failure.unauthorized',
            reason: 'signature_verification_failed',
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    });

    if (!isValidSignature) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const envelope = parseEnvelopeFromFailureBody(rawBody);
    const deadLetterId = envelope?.jobId ?? `qstash_failure_${Date.now()}`;
    const scanId = envelope?.payload?.scanId;
    const quoteId = envelope?.payload?.quoteId;
    const reason = request.headers.get('upstash-failure-cause') ?? 'qstash_delivery_exhausted';

    await recordDeadLetter({
        deadLetterId,
        jobId: envelope?.jobId,
        jobName: envelope?.jobName,
        scanId,
        quoteId,
        reason,
        rawFailureBody: rawBody,
    });

    if (envelope?.jobName === 'PROCESS_SCAN_ANALYSIS' && scanId) {
        await markScanFailed(scanId).catch((error) => {
            logger.error({
                action: 'queue.failure.scan_mark_failed.error',
                scanId,
                error: error instanceof Error ? error.message : String(error),
            });
        });
    }

    logger.error({
        action: 'queue.failure.dead_lettered',
        deadLetterId,
        jobId:   envelope?.jobId   ?? null,
        jobName: envelope?.jobName ?? null,
        scanId:  scanId  ?? null,
        quoteId: quoteId ?? null,
        reason,
    });

    // Alert the team so dead-lettered jobs are investigated, not silently lost
    Sentry.captureEvent({
        message : `[DLQ] Job ${envelope?.jobName ?? 'unknown'} (${deadLetterId}) permanently failed`,
        level   : 'error',
        extra   : { deadLetterId, jobId: envelope?.jobId, jobName: envelope?.jobName, scanId, quoteId, reason },
        tags    : { subsystem: 'queue', job: envelope?.jobName ?? 'unknown' },
    });

    return NextResponse.json({ ok: true });
}

