import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env' });

const { Client } = pg;

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
    console.error('DIRECT_URL is missing.');
    process.exit(1);
}

const scriptPath = path.join(process.cwd(), 'docs', 'ops', 'postgres-search-indexes.sql');
const sql = fs
    .readFileSync(scriptPath, 'utf8')
    .replace(/^\s*--.*$/gm, '');

const statements = sql
    .split(/;\s*(?:\r?\n|$)/g)
    .map((statement) => statement.trim())
    .filter(Boolean);

const client = new Client({
    connectionString: directUrl,
    ssl: directUrl.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
});

try {
    await client.connect();

    for (const [index, statement] of statements.entries()) {
        console.log(`Applying search statement ${index + 1}/${statements.length}...`);
        await client.query(statement);
    }

    console.log('PostgreSQL search indexes applied successfully.');
} catch (error) {
    console.error('Failed to apply PostgreSQL search indexes.');
    console.error(error);
    process.exitCode = 1;
} finally {
    await client.end().catch(() => undefined);
}
