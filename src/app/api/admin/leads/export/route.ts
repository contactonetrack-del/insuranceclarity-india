/**
 * GET /api/admin/leads/export
 *
 * Streams a CSV export of all leads for admin users.
 * Protected by ADMIN role check.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

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
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Build CSV
        const headers = ['id', 'name', 'email', 'phone', 'insuranceType', 'status', 'source', 'notes', 'createdAt', 'updatedAt'];
        const rows = [
            headers.join(','),
            ...leads.map(lead => toCSVRow([
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
            ])),
        ];

        const csvContent = rows.join('\n');
        const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;

        logger.info({ action: 'admin.leads.export', userId: session?.user?.email, count: leads.length });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'admin.leads.export.error', error: message });
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
