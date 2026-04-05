import 'server-only';

import crypto from 'crypto';
import { logger } from '@/lib/logger';
import type { ExtractedPdf } from './pdf.service';

/**
 * Extracts text from a PDF buffer using pdf-parse.
 * This file is server-only because pdf-parse pulls in server-side canvas/native
 * bindings that must never be bundled into client components.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractedPdf> {
    // Compute SHA-256 hash for deduplication (before parsing)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    try {
        const [mod, workerMod] = await Promise.all([
            import('pdf-parse'),
            import('pdf-parse/worker'),
        ]);

        // pdf-parse v2 exposes a class-based API. We pass the worker CanvasFactory
        // so serverless runtimes can avoid the native-binding failure path.
        const pdfParseCtor = (mod as { PDFParse?: new (options: { data: Buffer; CanvasFactory?: unknown }) => {
            getText: () => Promise<{ text: string; total: number; pages: Array<{ num: number; text: string }> }>;
            destroy: () => Promise<void>;
        } }).PDFParse;

        if (typeof pdfParseCtor === 'function') {
            const { CanvasFactory } = workerMod as { CanvasFactory: new () => object };
            const parser = new pdfParseCtor({ data: buffer, CanvasFactory });

            try {
                const data = await parser.getText();
                const text = data.text
                    .replace(/\r\n/g, '\n')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();

                logger.info({
                    action: 'pdf.extract',
                    pageCount: data.total ?? data.pages?.length ?? 0,
                    charCount: text.length,
                    hash: hash.substring(0, 8) + '…',
                });

                return {
                    text,
                    pageCount: data.total ?? data.pages?.length ?? 0,
                    charCount: text.length,
                    hash,
                };
            } finally {
                await parser.destroy().catch(() => undefined);
            }
        }

        // Legacy fallback: some installs still expose the old function form.
        const legacyPdfParse = (mod as { default?: unknown }).default ?? mod;
        if (typeof legacyPdfParse === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = await (legacyPdfParse as any)(buffer) as { text: string; numpages?: number; total?: number; pages?: Array<{ num: number; text: string }> };
            const text = data.text
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            logger.info({
                action: 'pdf.extract',
                pageCount: data.numpages ?? data.total ?? data.pages?.length ?? 0,
                charCount: text.length,
                hash: hash.substring(0, 8) + '…',
            });

            return {
                text,
                pageCount: data.numpages ?? data.total ?? data.pages?.length ?? 0,
                charCount: text.length,
                hash,
            };
        }

        throw new Error('Unsupported pdf-parse export shape.');
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error({
            action: 'pdf.extract.error',
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
        });
        throw new Error('Failed to extract text from PDF. The file may be scanned/image-based or password protected.');
    }
}
