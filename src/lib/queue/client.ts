import { Queue, Worker, Job } from 'bullmq';
import { redis } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

// Define Queues (Casting redis as any avoids version mismatch types between ioredis and bullmq inner ioredis)
export const emailQueue = new Queue('emails', { connection: redis as any });
export const advisorQueue = new Queue('ai_advisor_heavy_tasks', { connection: redis as any });

/**
 * Helper to queue a background quote process
 */
export async function queueQuoteProcessing(quoteId: string) {
    logger.info({ action: 'queueJob', queue: 'ai_advisor_heavy_tasks', jobName: 'process-quote', quoteId }, 'Queuing quote processing job');
    return await advisorQueue.add('process-quote', { quoteId }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    });
}

/**
 * Development Wrapper: In Vercel serverless you would NOT run this directly.
 * Instead, you'd use Upstash QStash, or run this Worker logic in a separate Long-Running environment (like Render/Railway).
 * Included here as per the standard architecture implementation.
 */
export function initializeDevelopmentWorkers() {
    if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
        const quoteWorker = new Worker('ai_advisor_heavy_tasks', async (job: Job) => {
            if (job.name === 'process-quote') {
                logger.info({ action: 'jobStart', queue: 'ai_advisor_heavy_tasks', jobId: job.id, quoteId: job.data.quoteId }, 'Worker started processing quote');
                // Simulate intense work
                await new Promise(res => setTimeout(res, 3000));
                logger.info({ action: 'jobComplete', queue: 'ai_advisor_heavy_tasks', jobId: job.id, quoteId: job.data.quoteId }, 'Worker finished processing quote');
                return { status: 'success' };
            }
        }, { connection: redis as any });

        quoteWorker.on('failed', (job, err) => {
            logger.error({ action: 'jobFailed', queue: 'ai_advisor_heavy_tasks', jobId: job?.id, error: err.message }, 'Background worker job failed');
        });

        logger.info("Development Background Workers Initialized.");
    }
}
