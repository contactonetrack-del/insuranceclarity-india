import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { logger } from '@/lib/logger';
import { getReport, getScanStatus } from '@/services/report.service';
import { canAccessScan, getClientIpFromHeaders } from '@/services/payment.service';
import { findResultAccessScan } from '@/services/ops.service';
import { verifyScanClaimToken } from '@/lib/security/scan-claim';
import type { FullReportResponse } from '@/types/report.types';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

function getRequestLocale(request: NextRequest): 'en' | 'hi' {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
    if (cookieLocale === 'hi') return 'hi';
    if (cookieLocale === 'en') return 'en';

    const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
    return acceptLanguage.includes('hi') ? 'hi' : 'en';
}

function addSection(
    doc: {
        moveDown: (lines?: number) => void;
        font: (name: string) => {
            fontSize: (size: number) => {
                text: (value: string, options?: { width?: number }) => void;
            };
        };
        text: (value: string, options?: { width?: number }) => void;
    },
    title: string,
    lines: string[],
) {
    if (lines.length === 0) return;

    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fontSize(13).text(title);
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10);
    for (const line of lines) {
        doc.text(`- ${line}`, { width: 500 });
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: scanId } = await params;
        if (!scanId) {
            return NextResponse.json({ error: 'scanId is required.' }, { status: 400 });
        }

        const session = await auth();
        const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const role = (session?.user as { role?: string } | undefined)?.role;
        const isAdmin = role === 'ADMIN';
        const requestIp = getClientIpFromHeaders(request.headers);
        const locale = getRequestLocale(request);
        const claimToken = request.headers.get('x-claim-token')
            ?? request.nextUrl.searchParams.get('ct');

        const scanAccess = await findResultAccessScan(scanId);

        if (!scanAccess) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        const claimTokenValid = !scanAccess.userId
            ? await verifyScanClaimToken(claimToken, scanId)
            : false;

        if (
            !canAccessScan({
                isAdmin,
                sessionUserId: userId,
                requestIp,
                ownerUserId: scanAccess.userId,
                ownerIp: scanAccess.ipAddress,
                claimTokenValid,
            })
        ) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        const statusData = await getScanStatus(scanId);
        if (!statusData) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        if (statusData.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Report is not ready for export yet.' },
                { status: 409 },
            );
        }

        if (!statusData.isPaid && !isAdmin) {
            return NextResponse.json(
                { error: 'PDF export is available after report unlock.' },
                { status: 402 },
            );
        }

        const report = await getReport({
            scanId,
            isPaid: true,
            locale,
        });

        if (!report || report.isPaid !== true) {
            return NextResponse.json(
                { error: 'Full report not available for export.' },
                { status: 404 },
            );
        }

        const full = report as FullReportResponse;
        const PDFDocument = (await import('pdfkit')).default;

        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 44,
                info: {
                    Title: 'Insurance Clarity Report',
                    Author: 'Insurance Clarity',
                },
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.font('Helvetica-Bold').fontSize(24).text('Insurance Clarity', { align: 'left' });
            doc.fontSize(11).fillColor('#64748b').text('Policy Analysis Report');
            doc.moveDown(1);

            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(`Report ID: ${scanId}`);
            doc.font('Helvetica').fontSize(10).text(`Generated: ${new Date().toLocaleString('en-IN')}`);
            doc.text(`Document: ${scanAccess.fileName}`);
            doc.moveDown(0.7);

            doc.font('Helvetica-Bold').fontSize(18).text(`Clarity Score: ${full.score}/100`);
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(11).text(full.summary, { width: 500 });

            addSection(
                doc,
                `Top Risks (${full.risks.length})`,
                full.risks.map((r) => `${r.title} [${r.severity}] - ${r.description}`),
            );

            addSection(
                doc,
                `Exclusions (${full.exclusions.length})`,
                full.exclusions.map((e) => `${e.clause} - ${e.impact}`),
            );

            addSection(
                doc,
                `Suggestions (${full.suggestions.length})`,
                full.suggestions.map((s) => `${s.action} [${s.priority}]`),
            );

            addSection(
                doc,
                `Hidden Clauses (${full.hiddenClauses.length})`,
                full.hiddenClauses.map((h) => `${h.clause} - ${h.risk}`),
            );

            doc.moveDown(1.2);
            doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(
                'This report is AI-generated and provided for informational purposes only. ' +
                'Please consult a licensed insurance advisor before making decisions.',
                { width: 500 },
            );

            doc.end();
        });

        logger.info({
            action: 'result.pdf.exported',
            scanId,
            userId: userId ?? 'anonymous',
        });

        return new NextResponse(pdfBuffer as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="insuranceclarity-report-${scanId}.pdf"`,
            },
        });
    } catch (error) {
        logger.error({
            action: 'result.pdf.error',
            error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json({ error: 'Failed to export report PDF.' }, { status: 500 });
    }
}
