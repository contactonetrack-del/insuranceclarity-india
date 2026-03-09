import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type JobNames = 'GENERATE_QUOTE_DOCUMENT';
type JobPayload = { quoteId?: string };

/**
 * Isolated Worker Route for Async Jobs
 * 
 * All server-only imports are lazy to prevent Turbopack from evaluating
 * BullMQ/Prisma connections during static build-time page-data collection.
 */
export async function POST(request: Request) {
    // Lazy imports to prevent Turbopack module-graph evaluation at build time
    const { logger } = await import('@/lib/logger');

    // 1. Authenticate the Queue invocation (Prevent external abuse)
    const secret = request.headers.get('X-Queue-Secret');
    if (secret !== process.env.QUEUE_SECRET) {
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
                await simulateHeavyPdfGeneration(payload, logger);
                break;
            default:
                logger.warn({ action: 'workerUnknownJob', jobName, jobId });
        }

        logger.info({ action: 'workerCompleted', jobName, jobId }, `Worker succeeded for job ${jobId}`);
        return NextResponse.json({ success: true, jobId });

    } catch (error) {
        logger.error({ action: 'workerFatalError', error }, 'Worker execution failed catastrophically');
        return NextResponse.json({ error: 'Worker Failed' }, { status: 500 });
    }
}

async function simulateHeavyPdfGeneration(payload: JobPayload, logger: any) {
    logger.debug({ action: 'pdfGenerationStarted', payload }, 'Rasterizing Policy Data...');

    // Simulate complex PDF rendering taking 3-5 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update quote status to READY in the database
    if (payload.quoteId && !payload.quoteId.startsWith('POL-')) {
        try {
            const { quoteRepository } = await import('@/repositories/quote.repository');
            await quoteRepository.update(payload.quoteId, { status: 'READY' });
        } catch (e) {
            logger.error({ action: 'pdfUpdateFailed', error: e });
        }
    }

    logger.debug({ action: 'pdfGenerationFinished', quoteId: payload.quoteId }, 'PDF Stored.');
}
