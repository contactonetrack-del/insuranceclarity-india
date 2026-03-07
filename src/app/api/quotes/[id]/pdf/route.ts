import PDFDocument from 'pdfkit';
import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '../../../../../lib/services/quote.service';

type QuoteDocument = {
    id: string;
    insuranceType: string;
    coverageAmount: number;
    premiumAmount: number;
    status: string;
    createdAt: Date | string;
};

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const quote = await loadQuote(id);

    if (!quote) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    try {
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 50,
                info: { Title: 'InsuranceClarity Policy', Author: 'InsuranceClarity' },
            });
            const buffers: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fontSize(28).text('InsuranceClarity', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).fillColor('gray').text('Official Binding Quote Document', { align: 'center' });
            doc.moveDown(3);

            doc.fillColor('black');
            doc.fontSize(14).text('Policy Tracking ID: ', { continued: true }).font('Helvetica-Bold').text(quote.id);
            doc.font('Helvetica');
            doc.moveDown(0.5);
            doc.text('Insurance Type: ', { continued: true }).font('Helvetica-Bold').text(quote.insuranceType);
            doc.font('Helvetica');
            doc.moveDown(0.5);
            doc.text('Coverage Amount: ', { continued: true }).font('Helvetica-Bold').text(
                `INR ${quote.coverageAmount.toLocaleString('en-IN')}`
            );
            doc.font('Helvetica');
            doc.moveDown(0.5);
            doc.text('Base Premium: ', { continued: true }).font('Helvetica-Bold').text(
                `INR ${quote.premiumAmount.toLocaleString('en-IN')} / month`
            );
            doc.font('Helvetica');
            doc.moveDown(0.5);
            doc.text('Date Issued: ', { continued: true }).font('Helvetica-Bold').text(
                new Date(quote.createdAt).toLocaleDateString('en-IN')
            );
            doc.font('Helvetica');

            doc.moveDown(4);
            doc.fontSize(11).fillColor('gray').text(
                'This document represents a legally binding provision for insurance ' +
                'subject to final underwriting approval. Generated asynchronously via the InsuranceClarity AI Underwriter system.',
                { align: 'justify' }
            );

            doc.end();
        });

        return new NextResponse(pdfBuffer as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="insuranceclarity-policy-${id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function loadQuote(id: string): Promise<QuoteDocument | null> {
    if (id.startsWith('POL-')) {
        return {
            id,
            insuranceType: 'Demonstration Policy',
            coverageAmount: 5000000,
            premiumAmount: 1560,
            status: 'READY',
            createdAt: new Date(),
        };
    }

    return quoteService.getQuoteById(id).catch(() => null);
}
