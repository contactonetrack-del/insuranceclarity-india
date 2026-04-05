import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { MeiliSearch } from 'meilisearch';
import productsData from '../data/mega-database.json';

// Path to pre-generated embeddings
const EMBEDDINGS_PATH = path.join(process.cwd(), 'src/data/products-embeddings.json');

/**
 * Meilisearch Data Synchronization Script
 * 
 * This script populates Meilisearch with insurance products and other searchable data.
 * Upgraded to support semantic vector search via embeddings.
 */
async function syncMeilisearch() {
    console.log('ðŸš€ Starting Meilisearch synchronization (Semantic Upgrade)...');

    try {
        // Initialize local client to ensure correct environment variables
        const client = new MeiliSearch({
            host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
            apiKey: process.env.MEILISEARCH_API_KEY || 'default-master-key',
        });

        // 1. Setup Insurance Products Index
        console.log('ðŸ“¦ Syncing Insurance Products index settings...');
        const productsIndex = client.index('insurance_products');
        const hiddenFactsIndex = client.index('hidden_facts');
        const claimCasesIndex = client.index('claim_cases');

        // Configure index settings (including Embedders for Semantic Search)
        await productsIndex.updateSettings({
            searchableAttributes: [
                'name',
                'description',
                'category',
                'subcategory',
                'sector',
                'related',
                'riskType',
            ],
            filterableAttributes: [
                'sector',
                'category',
                'users',
                'oecdClassification',
                'naicSector',
            ],
            sortableAttributes: [
                'id',
            ],
            rankingRules: [
                'words',
                'typo',
                'proximity',
                'attribute',
                'sort',
                'exactness',
            ],
            // Enable Vector Search Embedders
            embedders: {
                default: {
                    source: 'userProvided',
                    dimensions: 768, // Matches Gemini text-embedding-004 and BGE-Base-v1.5
                }
            }
        });

        // 2. Prepare Data with Vectors
        console.log('ðŸ“„ Loading product data and merging embeddings...');
        let embeddings: Record<string, number[]> = {};
        
        if (fs.existsSync(EMBEDDINGS_PATH)) {
            embeddings = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
            console.log(`âœ… Loaded ${Object.keys(embeddings).length} pre-calculated embeddings.`);
        } else {
            console.warn('âš ï¸ No embeddings found in data folder. Syncing without semantic vectors for now.');
        }

        const formattedProducts = productsData.map(p => {
            const id = p.id.toString();
            const productDoc: any = {
                ...p,
                id,
            };

            // Attach vector if present in cache
            if (embeddings[id]) {
                productDoc._vectors = {
                    default: embeddings[id]
                };
            }

            return productDoc;
        });

        // Batch upload products
        console.log(`ðŸ“¤ Uploading ${formattedProducts.length} documents...`);
        const productTask = await productsIndex.addDocuments(formattedProducts);
        console.log(`âœ… Products upload task queued: ${productTask.taskUid}`);

        // 3. Setup Hidden Facts Index
        console.log('ðŸ“¦ Syncing Hidden Facts Index Settings...');
        await hiddenFactsIndex.updateSettings({
            searchableAttributes: ['title', 'content', 'fact'],
            filterableAttributes: ['category', 'level'],
        });

        // 4. Setup Claim Cases Index Settings
        console.log('ðŸ“¦ Syncing Claim Cases Index Settings...');
        await claimCasesIndex.updateSettings({
            searchableAttributes: ['title', 'description', 'verdict'],
            filterableAttributes: ['category', 'status', 'outcome'],
        });

        console.log('âœ¨ Meilisearch configuration complete.');
        console.log('ðŸ“ Note: Document indexing happens asynchronously. Check Meilisearch dashboard for status.');

    } catch (error: any) {
        console.error('âŒ Meilisearch sync failed:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Body:', await error.response.text());
        }
        process.exit(1);
    }
}

// Execute sync
syncMeilisearch();

