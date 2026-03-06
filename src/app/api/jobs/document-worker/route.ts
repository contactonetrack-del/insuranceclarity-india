import { NextResponse } from 'next/server';
import { logger } from '../../../../lib/logger';
import { JobNames, JobPayload } from '../../../../lib/queue/jobs';

/**
 * Isolated Worker Route for Async Jobs
 * 
 * This route handler acts as the receiver for our Background Job Queue.
 * It strictly processes intensive computational tasks (like PDF Generation)
 * out-of-band so the main user thread isn't blocked.
 */
export async function POST(request: Request) {
    // 1. Authenticate the Queue invocation (Prevent external abuse)
    const secret = request.headers.get('X-Queue-Secret');
    if (secret !== (process.env.QUEUE_SECRET || 'dev-secret')) {
        logger.error({ action: 'workerUnauthorized', error: 'Invalid Queue Secret' });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { jobId, jobName, payload } = body as { jobId: string, jobName: JobNames, payload: JobPayload };

        if (!jobId || !jobName) {
            return NextResponse.json({ error: 'Invalid Job Payload' }, { status: 400 });
        }

        logger.info({ action: 'workerStarted', jobName, jobId }, `Worker processing job ${jobId}`);

        // 2. Perform the heavy lifting Based on Job Type
        switch (jobName) {
            case 'GENERATE_QUOTE_DOCUMENT':
                await simulateHeavyPdfGeneration(payload);
                break;
            default:
                logger.warn({ action: 'workerUnknownJob', jobName, jobId });
        }

        logger.info({ action: 'workerCompleted', jobName, jobId }, `Worker succeeded for job ${jobId}`);
        return NextResponse.json({ success: true, jobId });

    } catch (error) {
        logger.error({ action: 'workerFatalError', error }, 'Worker execution failed catastrophically');
        // We return 500 so an external Queue system (like AWS SQS) knows to retry the message
        return NextResponse.json({ error: 'Worker Failed' }, { status: 500 });
    }
}

/**
 * Simulates a massive CPU-bound or external blocking task.
 */
async function simulateHeavyPdfGeneration(payload: JobPayload) {
    logger.debug({ action: 'pdfGenerationStarted', payload }, 'Rasterizing Policy Data...');

    // Simulate complex PDF rendering taking 3-5 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    logger.debug({ action: 'pdfGenerationFinished', quoteId: payload.quoteId }, 'PDF Stored in S3 bucket.');
}
