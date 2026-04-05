import dotenv from 'dotenv';

dotenv.config();

const host = (process.env.MEILISEARCH_HOST ?? '').trim();
const apiKey = (process.env.MEILISEARCH_API_KEY ?? '').trim();

if (!host) {
  console.error('MEILISEARCH_HOST is missing.');
  process.exit(1);
}

if (!host.startsWith('https://') || host.toLowerCase().includes('localhost')) {
  console.error('MEILISEARCH_HOST must be an HTTPS cloud endpoint (not localhost) for production readiness.');
  process.exit(1);
}

const res = await fetch(`${host.replace(/\/$/, '')}/health`, {
  headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Meilisearch health check failed (${res.status}): ${text}`);
  process.exit(1);
}

const payload = await res.json().catch(() => null);
console.log('Meilisearch cloud health check passed.');
if (payload) {
  console.log(JSON.stringify(payload));
}
