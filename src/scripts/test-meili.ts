import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const client = new Meilisearch({
        host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
        apiKey: process.env.MEILISEARCH_API_KEY || 'default-master-key',
    });
    try {
        const health = await client.health();
        console.log('Health:', health);
        const indexes = await client.getIndexes();
        console.log('Indexes:', indexes.results.map(i => i.uid));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
