import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { generateEmbedding } from '../services/embedding.service';

// Load environment variables for local script execution
dotenv.config();
// Additionally try .env.local if needed
dotenv.config({ path: '.env.local' });

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/mega-database.json');
const CACHE_PATH = path.join(process.cwd(), 'src/data/products-embeddings.json');
const _BATCH_SIZE = 1; // Processing one by one to strictly respect Gemini RPM

interface Product {
    id: number;
    name: string;
    sector: string;
    category: string;
    subcategory: string;
    description: string;
}

interface EmbeddingCache {
    [id: string]: number[];
}

function getProductText(p: Product): string {
    return `Product: ${p.name}. Sector: ${p.sector}. Category: ${p.category} > ${p.subcategory}. Description: ${p.description}`.trim();
}

/**
 * Utility to sleep for a given duration.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateEmbeddings() {
    console.log('🔍 Initializing Hybrid Embedding Generation Pipeline...');
    console.log('⚡ Primary: Google Gemini (High Quota Free Tier)');
    console.log('🛡️ Fallback: Transformers.js (Local execution)');

    if (!fs.existsSync(PRODUCTS_PATH)) {
        console.error(`❌ Products file not found at: ${PRODUCTS_PATH}`);
        process.exit(1);
    }

    const products: Product[] = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
    let cache: EmbeddingCache = {};

    if (fs.existsSync(CACHE_PATH)) {
        console.log('📦 Loading existing embeddings from cache...');
        cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        
        // Basic check: if cache has 1536 entries, it's OpenAI. We need to clear it for 768.
        const firstValue = Object.values(cache)[0];
        if (firstValue && firstValue.length !== 768) {
            console.log('⚠️ Detected legacy embedding dimensions. Clearing cache for 768-dim migration...');
            cache = {};
        }
    }

    const toProcess = products.filter(p => !cache[p.id.toString()]);

    if (toProcess.length === 0) {
        console.log('✅ All products are already embedded with 768 dimensions. Nothing to do.');
        return;
    }

    console.log(`🚀 Processing ${toProcess.length} products...`);
    console.log(`⏳ Using 4s delay between Gemini calls to respect 15 RPM limit.`);

    for (let i = 0; i < toProcess.length; i++) {
        const product = toProcess[i];
        const text = getProductText(product);

        try {
            const embedding = await generateEmbedding(text);
            cache[product.id.toString()] = embedding;

            if (i % 10 === 0 || i === toProcess.length - 1) {
                console.log(`✅ Progress: ${i + 1} / ${toProcess.length} products processed.`);
                fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
            }

            // Wait 4 seconds between requests to stay safe under 15 RPM
            // This is annoying but necessary for "Free" gems. 
            // If the user wants speed, they upgrade or we use Local (which is infinite).
            if (i < toProcess.length - 1) {
                await sleep(4100); 
            }
        } catch (error) {
            console.error(`❌ Error at product ${product.id}:`, error);
            fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
            process.exit(1);
        }
    }

    console.log(`✨ Successfully generated embeddings for all products.`);
    console.log(`📁 Saved to: ${CACHE_PATH}`);
}

generateEmbeddings().catch(console.error);
