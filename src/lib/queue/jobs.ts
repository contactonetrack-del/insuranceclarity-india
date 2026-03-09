import { logger } from '../logger';

/**
 * Job Payload Types
 */
export interface GenerateQuoteDocumentPayload {
    quoteId: string;
    templateId: 'TERM_LIFE' | 'HOME' | 'MOTOR';
    customerEmail?: string;
}

export type JobPayload = GenerateQuoteDocumentPayload; // Union type as we add more jobs

export type JobNames = 'GENERATE_QUOTE_DOCUMENT';

/**
 * Async Job Queue Interface
 * 
 * In a production environment, this would enqueue messages to 
 * AWS SQS, BullMQ (Redis), or Google Cloud Tasks.
 * 
 * For this architecture demonstration, we simulate the fire-and-forget
 * delivery to our isolated worker endpoint.
 */
export class BackgroundQueue {
    async dispatch(jobName: JobNames, payload: JobPayload): Promise<string> {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        logger.info({ action: 'jobEnqueued', jobName, jobId }, `Enqueued ${jobName}`);

        // Since we are decoupling compute, we dispatch the HTTP request asynchronously
        // without `await`ing its resolution. The worker route takes over.

        // NOTE: In production Next.js on Vercel, hanging promises can be killed
        // abruptly if the Edge function terminates. Real implementations must use
        // managed queues (like Upstash QStash) which perform retries and DLQ routing.

        try {
            const workerUrl = process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}/api/jobs/document-worker`
                : 'http://localhost:3000/api/jobs/document-worker';

            // Fire and Forget execution
            fetch(workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Security header to ensure only our systems invoke the worker
                    'X-Queue-Secret': process.env.QUEUE_SECRET || (() => { throw new Error("QUEUE_SECRET is required"); })()
                },
                body: JSON.stringify({
                    jobId,
                    jobName,
                    payload
                })
            }).catch(err => {
                logger.error({ action: 'jobDispatchFailed', jobName, jobId, error: err.message });
            });

        } catch (error) {
            logger.error({ action: 'jobDispatchFatal', jobName, jobId, error });
        }

        return jobId; // Return the tracking token back to the client immediately
    }
}

export const queue = new BackgroundQueue();
