import { indexes } from '../lib/search/meilisearch';
import productsData from '../data/mega-database.json';

/**
 * Meilisearch Data Synchronization Script
 * 
 * This script populates Meilisearch with insurance products and other searchable data.
 * Run this during deployment or build phase to ensure search parity.
 */

async function syncMeilisearch() {
    console.log('🚀 Starting Meilisearch synchronization...');

    try {
        // 1. Setup Insurance Products Index
        console.log('📦 Syncing Insurance Products...');
        const productsIndex = indexes.products;

        // Configure index settings
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
        });

        // Batch upload products (Meilisearch handles batches automatically but we can Chunk if needed)
        // Adjusting ID to string since Meilisearch prefers string IDs for documents
        const formattedProducts = productsData.map(p => ({
            ...p,
            id: p.id.toString(),
        }));

        const productTask = await productsIndex.addDocuments(formattedProducts);
        console.log(`✅ Products upload task queued: ${productTask.taskUid}`);

        // 2. Setup Hidden Facts Index (if data exists)
        // Note: For now we'll just prep the index settings. 
        // In a real prod env, we'd fetch this from Prisma.
        console.log('📦 Syncing Hidden Facts Index Settings...');
        await indexes.hiddenFacts.updateSettings({
            searchableAttributes: ['title', 'content', 'fact'],
            filterableAttributes: ['category', 'level'],
        });

        // 3. Setup Claim Cases Index Settings
        console.log('📦 Syncing Claim Cases Index Settings...');
        await indexes.claimCases.updateSettings({
            searchableAttributes: ['title', 'description', 'verdict'],
            filterableAttributes: ['category', 'status', 'outcome'],
        });

        console.log('✨ Meilisearch configuration complete.');
        console.log('📝 Note: Document indexing happens asynchronously. Check Meilisearch dashboard for status.');

    } catch (error) {
        console.error('❌ Meilisearch sync failed:', error);
        process.exit(1);
    }
}

// Execute sync
syncMeilisearch();
