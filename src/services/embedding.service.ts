/**
 * Embedding Service - high-resiliency semantic vector generation.
 *
 * Provider strategy:
 * 1. Google Gemini (primary)
 * 2. Transformers.js local model (fallback)
 */

import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

const GEMINI_MODEL = 'models/gemini-embedding-001';
const LOCAL_MODEL = 'BAAI/bge-base-en-v1.5';
const EXPECTED_EMBEDDING_DIMENSIONS = 768;

let _localPipeline: unknown = null;
let _localPipelineLoading: Promise<unknown> | null = null;
let geminiDisabledReason: string | null = null;

/**
 * Generates embeddings using Google Gemini.
 */
async function generateGeminiEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.embedContent(text.slice(0, 30000));
    const vector = Array.from(result.embedding.values);

    if (vector.length !== EXPECTED_EMBEDDING_DIMENSIONS) {
        throw new Error(
            `Gemini returned ${vector.length} dimensions, expected ${EXPECTED_EMBEDDING_DIMENSIONS}. Falling back to local embeddings.`,
        );
    }

    return vector;
}

/**
 * Generates embeddings using local Transformers.js model.
 */
async function generateLocalEmbedding(text: string): Promise<number[]> {
    try {
        if (!_localPipeline) {
            logger.info({ action: 'embedding.local_load_start', model: LOCAL_MODEL });
            if (!_localPipelineLoading) {
                _localPipelineLoading = (async () => {
                    const { pipeline } = await import('@huggingface/transformers');
                    return pipeline('feature-extraction', LOCAL_MODEL);
                })();
            }
            try {
                _localPipeline = await _localPipelineLoading;
            } catch (error) {
                _localPipelineLoading = null;
                throw error;
            }
            logger.info({ action: 'embedding.local_load_complete' });
        }

        const pipelineCall = _localPipeline as (t: string, o: object) => Promise<{ data: Float32Array }>;
        const output = await pipelineCall(text, { pooling: 'mean', normalize: true });
        const vector = Array.from(output.data);

        if (vector.length !== EXPECTED_EMBEDDING_DIMENSIONS) {
            throw new Error(
                `Local model returned ${vector.length} dimensions, expected ${EXPECTED_EMBEDDING_DIMENSIONS}.`,
            );
        }

        return vector;
    } catch (error) {
        logger.error({ action: 'embedding.local_failed', error });
        throw error;
    }
}

/**
 * Hybrid embedding generation:
 * Gemini -> local fallback -> error.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();

    if (process.env.GEMINI_API_KEY && !geminiDisabledReason) {
        try {
            const vector = await generateGeminiEmbedding(text);
            logger.debug({ action: 'embedding.gemini_success', ms: Date.now() - startTime });
            return vector;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isQuota = errorMessage.includes('429') || errorMessage.includes('quota');
            geminiDisabledReason = errorMessage;
            logger.warn({
                signal: isQuota ? 'embedding.gemini_quota_reached' : 'embedding.gemini_failed',
                error: errorMessage,
            });
        }
    }

    try {
        const vector = await generateLocalEmbedding(text);
        logger.info({ action: 'embedding.local_fallback_success', ms: Date.now() - startTime });
        return vector;
    } catch (error) {
        logger.error({ action: 'embedding.all_failed', error: String(error) });
        throw new Error('All embedding providers failed or are unconfigured.');
    }
}

/**
 * Batch embedding helper with sequential processing.
 */
export async function embedChunks(texts: string[]): Promise<number[][]> {
    logger.info({ action: 'embedding.batch_start', count: texts.length });

    const results: number[][] = [];
    for (const text of texts) {
        results.push(await generateEmbedding(text));
    }

    return results;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        logger.warn({ signal: 'embedding.dimension_mismatch', a: a.length, b: b.length });
        return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
