import { logger } from '../logger';
import { redisClient } from '../cache/redis';
import {
    getQstashClient,
    getQstashRetries,
    getQstashRetryDelayExpression,
    getQstashTimeoutSeconds,
    getQueueProvider,
    getQueueSecret,
    getWorkerEndpointUrl,
} from './config';

/**
 * Job Payload Types
 */
export interface GenerateQuoteDocumentPayload {
    quoteId: string;
    templateId: 'TERM_LIFE' | 'HOME' | 'MOTOR';
    customerEmail?: string;
}

export interface ProcessScanAnalysisPayload {
    scanId: string;
    fileName: string;
    fileHash?: string;
    userId?: string;
    locale?: 'en' | 'hi';
}

export type JobPayload = GenerateQuoteDocumentPayload | ProcessScanAnalysisPayload;
export type JobNames = 'GENERATE_QUOTE_DOCUMENT' | 'PROCESS_SCAN_ANALYSIS';

const MAX_DISPATCH_ATTEMPTS = Number.parseInt(process.env.QUEUE_DISPATCH_MAX_ATTEMPTS ?? '3', 10);
const BASE_RETRY_DELAY_MS = Number.parseInt(process.env.QUEUE_DISPATCH_BASE_DELAY_MS ?? '1200', 10);
const DEAD_LETTER_TTL_SECONDS = 60 * 60 * 24 * 7;

function normalizeAttempts(value: number): number {
    if (!Number.isFinite(value)) return 3;
    return Math.min(5, Math.max(1, Math.floor(value)));
}

function normalizeRetryDelay(value: number): number {
    if (!Number.isFinite(value)) return 1200;
    return Math.min(10_000, Math.max(250, Math.floor(value)));
}

function isProcessScanPayload(payload: JobPayload): payload is ProcessScanAnalysisPayload {
    return typeof (payload as ProcessScanAnalysisPayload).scanId === 'string';
}

/**
 * Async Job Queue Interface
 *
 * - `qstash` provider: fully managed durable queue with at-least-once delivery and retries.
 * - `http` provider: compatibility fallback for local/dev via direct worker dispatch.
 */
export class BackgroundQueue {
    async dispatch(jobName: JobNames, payload: JobPayload): Promise<string> {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const provider = getQueueProvider();

        logger.info({ action: 'jobEnqueued', provider, jobName, jobId }, `Enqueued ${jobName}`);

        if (provider === 'qstash') {
            await this.dispatchViaQstash(jobId, jobName, payload);
            return jobId;
        }

        const queueSecret = getQueueSecret();
        const attempts = normalizeAttempts(MAX_DISPATCH_ATTEMPTS);
        const retryDelayMs = normalizeRetryDelay(BASE_RETRY_DELAY_MS);

        // Fire-and-forget on fallback provider: caller gets jobId immediately.
        void this.dispatchViaHttpAttempt({
            jobId,
            jobName,
            payload,
            queueSecret,
            workerUrl: getWorkerEndpointUrl('/api/jobs/document-worker'),
            attempt: 1,
            maxAttempts: attempts,
            retryDelayMs,
        });

        return jobId;
    }

    private async dispatchViaQstash(jobId: string, jobName: JobNames, payload: JobPayload): Promise<void> {
        const client = getQstashClient();
        const queueSecret = getQueueSecret();
        const workerUrl = getWorkerEndpointUrl('/api/jobs/document-worker');
        const failureCallbackUrl = getWorkerEndpointUrl('/api/jobs/document-worker/failure');

        const retries = getQstashRetries();
        const retryDelay = getQstashRetryDelayExpression();
        const timeout = getQstashTimeoutSeconds();

        const response = await client.publishJSON({
            url: workerUrl,
            body: {
                jobId,
                jobName,
                payload,
                attempt: 1,
                maxAttempts: retries + 1,
                provider: 'qstash',
                dispatchedAt: new Date().toISOString(),
            },
            headers: {
                'Content-Type': 'application/json',
                'X-Queue-Secret': queueSecret,
                'X-Queue-Provider': 'qstash',
            },
            retries,
            retryDelay,
            timeout,
            deduplicationId: `${jobName}:${jobId}`,
            failureCallback: failureCallbackUrl,
        });

        logger.info({
            action: 'jobDispatchSucceeded',
            provider: 'qstash',
            jobName,
            jobId,
            qstashMessageId: response.messageId,
            retries,
            retryDelay,
            timeout,
        });
    }

    private async dispatchViaHttpAttempt(params: {
        jobId: string;
        jobName: JobNames;
        payload: JobPayload;
        queueSecret: string;
        workerUrl: string;
        attempt: number;
        maxAttempts: number;
        retryDelayMs: number;
    }): Promise<void> {
        const {
            jobId,
            jobName,
            payload,
            queueSecret,
            workerUrl,
            attempt,
            maxAttempts,
            retryDelayMs,
        } = params;

        try {
            const response = await fetch(workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Queue-Secret': queueSecret,
                    'X-Queue-Provider': 'http',
                },
                body: JSON.stringify({
                    jobId,
                    jobName,
                    payload,
                    attempt,
                    maxAttempts,
                    provider: 'http',
                    dispatchedAt: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Worker responded with ${response.status}`);
            }

            logger.info({
                action: 'jobDispatchSucceeded',
                provider: 'http',
                jobName,
                jobId,
                attempt,
                maxAttempts,
            });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn({
                action: 'jobDispatchFailed',
                provider: 'http',
                jobName,
                jobId,
                attempt,
                maxAttempts,
                error: message,
            });

            if (attempt < maxAttempts) {
                const delayMs = retryDelayMs * attempt;
                setTimeout(() => {
                    void this.dispatchViaHttpAttempt({
                        ...params,
                        attempt: attempt + 1,
                    });
                }, delayMs);
                return;
            }

            await this.deadLetter({
                jobId,
                jobName,
                payload,
                error: message,
                attempts: maxAttempts,
                source: 'http-dispatch',
            });

            // Last-resort fallback for scan jobs: try processing from stored file.
            if (jobName === 'PROCESS_SCAN_ANALYSIS' && isProcessScanPayload(payload)) {
                try {
                    const { processScanFromStoredFile } = await import('./scan-queue');
                    await processScanFromStoredFile({
                        scanId: payload.scanId,
                        fileName: payload.fileName,
                        fileHash: payload.fileHash,
                        userId: payload.userId,
                        locale: payload.locale,
                    });

                    logger.info({
                        action: 'jobLocalFallbackSucceeded',
                        source: 'http-dispatch',
                        jobId,
                        jobName,
                        scanId: payload.scanId,
                    });
                } catch (fallbackError) {
                    const fallbackMessage = fallbackError instanceof Error
                        ? fallbackError.message
                        : String(fallbackError);

                    logger.error({
                        action: 'jobLocalFallbackFailed',
                        source: 'http-dispatch',
                        jobId,
                        jobName,
                        scanId: payload.scanId,
                        error: fallbackMessage,
                    });
                }
            }
        }
    }

    private async deadLetter(params: {
        jobId: string;
        jobName: JobNames;
        payload: JobPayload;
        error: string;
        attempts: number;
        source: string;
    }) {
        const key = `queue:dead-letter:${params.jobId}`;
        const payload = {
            ...params,
            failedAt: new Date().toISOString(),
        };

        if (redisClient.isConfigured()) {
            await redisClient.set(key, payload, { ex: DEAD_LETTER_TTL_SECONDS });
        }

        logger.error({ action: 'jobDeadLettered', ...payload });
    }
}

export const queue = new BackgroundQueue();

