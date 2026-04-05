// @vitest-environment node

import PDFDocument from 'pdfkit';
import { beforeAll, describe, expect, it, vi } from 'vitest';

let extractTextFromPdf: typeof import('../pdf-extraction.server').extractTextFromPdf;

beforeAll(async () => {
    vi.mock('server-only', () => ({}));
    ({ extractTextFromPdf } = await import('../pdf-extraction.server'));
});

function createTextPdfBuffer(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 72 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });
        doc.on('error', reject);
        doc.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        doc.fontSize(18).text(text);
        doc.end();
    });
}

describe('pdf.service', () => {
    it('extracts text from a generated text-based pdf', async () => {
        const buffer = await createTextPdfBuffer('Insurance Clarity queue verification');
        const result = await extractTextFromPdf(buffer);

        expect(result.text).toContain('Insurance Clarity queue verification');
        expect(result.pageCount).toBe(1);
        expect(result.charCount).toBeGreaterThan(0);
        expect(result.hash).toHaveLength(64);
    });
});
