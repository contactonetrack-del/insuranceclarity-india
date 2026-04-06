/**
 * Embedding Service â€” High-Resiliency Semantic Vector Generation
 *
 * Implements a hybrid provider architecture:
 * 1. Google Gemini (Primary) - High-quota free tier (768 dimensions)
 * 2. Transformers.js (Fallback) - Local execution, infinite quota (768 dimensions)
  */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { pipeline } from '@xenova/transformers';
import { logger } from '@/lib/logger';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GEMINI_MODEL = 'models/gemini-embedding-001';
const LOCAL_MODEL  = 'Xenova/bge-base-en-v1.5'; // 768 dimensions (matches Gemini)

// Cache for local model instance
let _localPipeline: unknown = null; // Transformers pipeline: using unknown here as xenova types are complex to import in nextjs

// â”€â”€â”€ Provider Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Generates embeddings using Google Gemini (Primary).
 * Quota: 15 RPM (Free Tier).
 */
async function generateGeminiEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.embedContent(text.slice(0, 30000)); // Gemini has high limit
    return Array.from(result.embedding.values);
}

/**
 * Generates embeddings using Local Transformers.js (Fallback).
 * Pros: Infinite quota, Zero latency after model load.
 */
async function generateLocalEmbedding(text: string): Promise<number[]> {
    try {
        if (!_localPipeline) {
            logger.info({ action: 'embedding.local_load_start', model: LOCAL_MODEL });
            _localPipeline = await pipeline('feature-extraction', LOCAL_MODEL);
            logger.info({ action: 'embedding.local_load_complete' });
        }

        // Transformers.js pipeline is a function that returns the embedding data
        const pipelineCall = _localPipeline as (t: string, o: object) => Promise<{ data: Float32Array }>;
        const output = await pipelineCall(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    } catch (error) {
        logger.error({ action: 'embedding.local_failed', error });
        throw error;
    }
}

// â”€â”€â”€ Main Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Hybrid Embedding Generation: Gemini -> Local -> Error.
 * Automatically switches to local if Gemini fails (e.g. quota limit).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();

    // 1. Try Google Gemini (Primary)
    if (process.env.GEMINI_API_KEY) {
        try {
            const vector = await generateGeminiEmbedding(text);
            logger.debug({ action: 'embedding.gemini_success', ms: Date.now() - startTime });
            return vector;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isQuota = errorMessage.includes('429') || errorMessage.includes('quota');
            logger.warn({ 
                signal: isQuota ? 'embedding.gemini_quota_reached' : 'embedding.gemini_failed', 
                error: errorMessage 
            });
            
            // Continue to fallback
        }
    }

    // 2. Try Local Fallback (Transformers.js)
    try {
        const vector = await generateLocalEmbedding(text);
        logger.info({ action: 'embedding.local_fallback_success', ms: Date.now() - startTime });
        return vector;
    } catch (error) {
        // 3. Last resort
        logger.error({ action: 'embedding.all_failed', error: String(error) });
        throw new Error('All embedding providers failed or are unconfigured.');
    }
}

/**
 * Batch embedding with adaptive provider logic.
 */
export async function embedChunks(texts: string[]): Promise<number[][]> {
    logger.info({ action: 'embedding.batch_start', count: texts.length });
    
    const results: number[][] = [];
    // We process sequentially or in small parallel batches to respect Gemini's 15 RPM
    for (const text of texts) {
        results.push(await generateEmbedding(text));
    }

    return results;
}

/**
 * Compute cosine similarity between two vectors.
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
        dot   += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

