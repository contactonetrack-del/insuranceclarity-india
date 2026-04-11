/**
 * GET /api/admin/leads/export
 *
 * Streams a CSV export of all leads for admin users.
 * Protected by ADMIN role check.
 * Uses pagination and streaming to handle large datasets efficiently.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/api/error-response';
import { countLeads, listLeadsBatch } from '@/services/ops.service';

export const dynamic = 'force-dynamic';

const BATCH_SIZE = 1000; // Process leads in batches to avoid memory issues

function toCSVRow(values: (string | number | boolean | Date | null | undefined)[]): string {
    return values.map(v => {
        const str = v instanceof Date ? v.toISOString() : String(v ?? '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }).join(',');
}

export async function GET() {
    try {
        // Admin auth check
        const session = await auth();
        const role = (session?.user as { role?: string })?.role;

        if (!session || role !== 'ADMIN') {
            return ErrorFactory.forbidden('Only admins can export leads');
        }

        // Get total count for logging
        const totalCount = await countLeads();

        // Create a ReadableStream for streaming CSV data
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Write CSV headers
                    const headers = ['id', 'name', 'email', 'phone', 'insuranceType', 'status', 'source', 'notes', 'createdAt', 'updatedAt'];
                    controller.enqueue(headers.join(',') + '\n');

                    let processedCount = 0;
                    let hasMore = true;
                    let cursor: string | undefined;

                    while (hasMore) {
                        // Fetch leads in batches using cursor-based pagination
                        const leads = await listLeadsBatch(cursor, BATCH_SIZE);

                        if (leads.length === 0) {
                            hasMore = false;
                            break;
                        }

                        // Process batch and write to stream
                        for (const lead of leads) {
                            const row = toCSVRow([
                                lead.id,
                                lead.name,
                                lead.email,
                                lead.phone,
                                lead.insuranceType,
                                lead.status,
                                lead.source,
                                lead.notes ?? '',
                                lead.createdAt,
                                lead.updatedAt,
                            ]);
                            controller.enqueue(row + '\n');
                            processedCount++;
                        }

                        // Set cursor for next batch (use last lead's ID)
                        cursor = leads[leads.length - 1]?.id;

                        // Check if we've processed all leads
                        if (leads.length < BATCH_SIZE) {
                            hasMore = false;
                        }
                    }

                    controller.close();

                    logger.info({
                        action: 'admin.leads.export.streamed',
                        userId: session?.user?.email,
                        totalCount,
                        processedCount,
                        batchSize: BATCH_SIZE
                    });

                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.error({ action: 'admin.leads.export.stream.error', error: message });
                    controller.error(new Error('Export failed during streaming'));
                }
            }
        });

        const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
                'Transfer-Encoding': 'chunked', // Enable chunked transfer for streaming
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'admin.leads.export.error', error: message });
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
