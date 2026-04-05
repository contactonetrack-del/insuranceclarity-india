/**
 * PDF Service - Validate files and chunk extracted text for AI processing.
 *
 * Server-side extraction now lives in `pdf-extraction.server.ts` so the
 * browser bundle never pulls in pdf-parse or its native canvas dependency.
 */

import { logger } from '@/lib/logger';

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_KB = MAX_FILE_SIZE_MB * 1024;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

export const CHUNK_SIZE = 1500; // characters per chunk
export const CHUNK_OVERLAP = 150; // overlap to preserve context across chunks
export const MAX_CHUNKS = 40; // cap to control token cost

export interface PdfValidationResult {
    valid: boolean;
    error?: string;
}

export interface ExtractedPdf {
    text: string;
    pageCount: number;
    charCount: number;
    hash: string; // SHA-256 of raw buffer
}

export interface TextChunk {
    index: number;
    text: string;
    charStart: number;
    charEnd: number;
}

/**
 * Validates a File object before processing.
 * Checks MIME type and size constraints.
 */
export function validatePdfFile(file: File): PdfValidationResult {
    if (!file) {
        return { valid: false, error: 'No file provided.' };
    }

    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only PDF files are accepted.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        };
    }

    if (file.size < 1024) {
        return { valid: false, error: 'File appears to be empty or corrupt.' };
    }

    return { valid: true };
}

/**
 * Validates a Buffer/ArrayBuffer (server-side).
 */
export function validatePdfBuffer(
    buffer: Buffer,
    mimeType: string,
    originalName: string,
): PdfValidationResult {
    if (mimeType !== 'application/pdf') {
        if (!originalName.toLowerCase().endsWith('.pdf')) {
            return { valid: false, error: 'Only PDF files are accepted.' };
        }
    }

    const header = buffer.slice(0, 5).toString('ascii');
    if (!header.startsWith('%PDF')) {
        return { valid: false, error: 'File does not appear to be a valid PDF.' };
    }

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        };
    }

    return { valid: true };
}

/**
 * Splits extracted PDF text into overlapping chunks for AI processing.
 * Uses sliding window with overlap to preserve context at boundaries.
 */
export function chunkText(text: string): TextChunk[] {
    if (!text || text.length === 0) return [];

    const chunks: TextChunk[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + CHUNK_SIZE, text.length);
        const chunkText = text.slice(start, end);

        if (chunkText.trim().length > 50) {
            chunks.push({
                index: chunks.length,
                text: chunkText.trim(),
                charStart: start,
                charEnd: end,
            });
        }

        if (chunks.length >= MAX_CHUNKS) break;

        start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    logger.debug({
        action: 'pdf.chunk',
        totalChunks: chunks.length,
        totalChars: text.length,
    });

    return chunks;
}

/**
 * Selects the most relevant chunks for AI analysis.
 * For MVP: takes first N + last N chunks (covers intro & exclusions sections).
 */
export function selectRepresentativeChunks(chunks: TextChunk[], maxChunks = 20): TextChunk[] {
    if (chunks.length <= maxChunks) return chunks;

    const halfN = Math.floor(maxChunks / 2);
    const firstHalf = chunks.slice(0, halfN);
    const lastHalf = chunks.slice(-halfN);

    return [...firstHalf, ...lastHalf];
}
