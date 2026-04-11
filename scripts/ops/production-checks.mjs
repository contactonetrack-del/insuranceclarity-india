import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const DEFAULT_BASE_URL = 'https://insuranceclarity.vercel.app';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultSamplePdfPath = path.join(repoRoot, 'public', 'PDFs', 'health-buying-checklist.pdf');

function sanitizeBaseUrl(input) {
    return input.replace(/\/+$/, '');
}

export function resolveBaseUrl() {
    const envBaseUrl =
        process.env.VERIFY_DEPLOY_BASE_URL?.trim() ||
        process.env.APP_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_APP_URL?.trim();

    return sanitizeBaseUrl(envBaseUrl || DEFAULT_BASE_URL);
}

export function resolveSamplePdfPath(inputPath) {
    return inputPath ? path.resolve(inputPath) : defaultSamplePdfPath;
}

export function isPlaceholderValue(value) {
    if (!value) {
        return true;
    }

    const normalized = value.trim().toLowerCase();
    return (
        normalized.includes('replace_with') ||
        normalized.includes('your_') ||
        normalized.includes('mock') ||
        normalized === 'changeme'
    );
}

export function cookieHeader(jar) {
    if (!jar || jar.size === 0) {
        return '';
    }

    return Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
}

function applySetCookies(response, jar) {
    if (!jar) {
        return;
    }

    const getSetCookie = response.headers.getSetCookie?.bind(response.headers);
    const setCookies = typeof getSetCookie === 'function' ? getSetCookie() : [];

    for (const cookie of setCookies) {
        const firstPair = cookie.split(';', 1)[0];
        const separatorIndex = firstPair.indexOf('=');
        if (separatorIndex <= 0) {
            continue;
        }

        const name = firstPair.slice(0, separatorIndex).trim();
        const value = firstPair.slice(separatorIndex + 1).trim();
        jar.set(name, value);
    }
}

export async function fetchWithCookies(url, options = {}) {
    const { jar, headers, ...init } = options;
    const nextHeaders = new Headers(headers || {});
    const serializedCookies = cookieHeader(jar);
    if (serializedCookies) {
        nextHeaders.set('cookie', serializedCookies);
    }

    const response = await fetch(url, {
        ...init,
        headers: nextHeaders,
        redirect: init.redirect ?? 'follow',
    });

    applySetCookies(response, jar);
    return response;
}

export async function parseResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

export async function fetchJson(url, options = {}) {
    const response = await fetchWithCookies(url, options);
    const body = await parseResponseBody(response);
    return { response, body };
}

export async function issueCsrfSession(baseUrl) {
    const jar = new Map();
    const { response, body } = await fetchJson(`${baseUrl}/api/csrf`, { jar });

    if (!response.ok) {
        throw new Error(`CSRF endpoint failed with ${response.status}`);
    }

    if (!body || typeof body !== 'object' || !body.csrfToken) {
        throw new Error('CSRF endpoint did not return a token.');
    }

    return {
        jar,
        csrfToken: body.csrfToken,
    };
}

export async function uploadSamplePdf(baseUrl, { jar, csrfToken, samplePdfPath }) {
    const resolvedPdfPath = resolveSamplePdfPath(samplePdfPath);
    const pdfBuffer = await fs.readFile(resolvedPdfPath);
    const form = new FormData();
    form.set('file', new File([pdfBuffer], path.basename(resolvedPdfPath), { type: 'application/pdf' }));

    const { response, body } = await fetchJson(`${baseUrl}/api/upload`, {
        method: 'POST',
        jar,
        headers: {
            'x-csrf-token': csrfToken,
        },
        body: form,
    });

    if (!response.ok) {
        throw new Error(`Upload failed with ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }

    if (!body || typeof body !== 'object' || !body.scanId) {
        throw new Error('Upload response did not include a scanId.');
    }

    return {
        scanId: body.scanId,
        claimToken: body.claimToken ?? null,
        fileName: body.fileName ?? path.basename(resolvedPdfPath),
    };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollScanStatus(baseUrl, { jar, scanId, claimToken, attempts = 48, intervalMs = 5000 }) {
    let lastBody = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const { response, body } = await fetchJson(`${baseUrl}/api/result/${scanId}?status=true`, {
            jar,
            headers: claimToken ? { 'x-claim-token': claimToken } : undefined,
        });

        lastBody = body;

        if (!response.ok) {
            throw new Error(`Result polling failed with ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
        }

        if (body?.status === 'COMPLETED') {
            return body;
        }

        if (body?.status === 'FAILED') {
            throw new Error(`Scan processing failed: ${JSON.stringify(body)}`);
        }

        if (attempt < attempts) {
            await sleep(intervalMs);
        }
    }

    throw new Error(`Scan did not complete within ${attempts * intervalMs}ms. Last payload: ${JSON.stringify(lastBody)}`);
}

export async function fetchReport(baseUrl, { jar, scanId, claimToken }) {
    const { response, body } = await fetchJson(`${baseUrl}/api/result/${scanId}`, {
        jar,
        headers: claimToken ? { 'x-claim-token': claimToken } : undefined,
    });

    if (!response.ok) {
        throw new Error(`Report fetch failed with ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }

    return body;
}

export async function createPaymentOrder(baseUrl, { jar, csrfToken, scanId, claimToken }) {
    const { response, body } = await fetchJson(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        jar,
        headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
            ...(claimToken ? { 'x-claim-token': claimToken } : {}),
        },
        body: JSON.stringify({ scanId }),
    });

    if (!response.ok) {
        throw new Error(`Payment order creation failed with ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }

    if (!body?.orderId) {
        throw new Error('Payment order response did not include an orderId.');
    }

    return body;
}

function parseSentryDsn(dsn) {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\/+/, '');

    if (!projectId || !url.username) {
        throw new Error('Invalid Sentry DSN.');
    }

    return {
        dsn,
        envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
    };
}

export async function sendSentryProbe({ baseUrl, release = 'repo-post-deploy-check' } = {}) {
    const dsn = process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || '';
    if (!dsn || isPlaceholderValue(dsn)) {
        return { skipped: true, reason: 'SENTRY_DSN is missing or placeholder-like.' };
    }

    const { envelopeUrl } = parseSentryDsn(dsn);
    const eventId = randomUUID().replace(/-/g, '');
    const sentAt = new Date().toISOString();
    const payload = {
        event_id: eventId,
        level: 'info',
        message: 'post-deployment verification probe',
        timestamp: Math.floor(Date.now() / 1000),
        platform: 'javascript',
        release,
        tags: {
            subsystem: 'deployment-verifier',
            probe: 'true',
        },
        extra: {
            baseUrl: baseUrl || resolveBaseUrl(),
        },
    };

    const envelope = [
        JSON.stringify({ event_id: eventId, sent_at: sentAt, dsn }),
        JSON.stringify({ type: 'event' }),
        JSON.stringify(payload),
    ].join('\n');

    const response = await fetch(envelopeUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-sentry-envelope',
        },
        body: envelope,
    });

    if (!response.ok) {
        throw new Error(`Sentry probe failed with ${response.status}`);
    }

    return {
        skipped: false,
        accepted: true,
        eventId,
        status: response.status,
    };
}
