import { Client, Receiver } from '@upstash/qstash';
import { isPlaceholderValue } from '@/lib/security/env';

export type QueueProvider = 'qstash' | 'http';

const DEFAULT_QSTASH_RETRIES = 5;
const DEFAULT_QSTASH_RETRY_DELAY = 'min(60000, 1000 * pow(2, retried))';
const DEFAULT_QSTASH_TIMEOUT_SECONDS = 60;

let qstashClientSingleton: Client | null = null;
let qstashReceiverSingleton: Receiver | null = null;

function trimValue(value: string | undefined | null): string {
    return value?.trim() ?? '';
}

function normalizeUrl(value: string): string {
    return value.replace(/\/+$/, '');
}

function isVercelHostedUrl(value: string): boolean {
    try {
        const hostname = new URL(value).hostname.toLowerCase();
        return hostname.endsWith('.vercel.app');
    } catch {
        return false;
    }
}

function normalizeProvider(value: string): QueueProvider {
    return value.toLowerCase() === 'qstash' ? 'qstash' : 'http';
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
}

export function getQueueProvider(): QueueProvider {
    const configured = trimValue(process.env.QUEUE_PROVIDER);
    if (configured) return normalizeProvider(configured);

    // Default to managed queue when credentials are available.
    const hasQstashToken = Boolean(trimValue(process.env.QSTASH_TOKEN));
    return hasQstashToken ? 'qstash' : 'http';
}

export function getQueueSecret(): string {
    const secret = trimValue(process.env.QUEUE_SECRET);
    if (!secret || isPlaceholderValue(secret)) {
        throw new Error('QUEUE_SECRET is required and must not be a placeholder.');
    }
    return secret;
}

export function getPublicAppUrl(): string {
    const candidates = [
        trimValue(process.env.NEXT_PUBLIC_APP_URL),
        trimValue(process.env.BETTER_AUTH_URL),
        trimValue(process.env.NEXTAUTH_URL),
        trimValue(process.env.APP_BASE_URL),
        process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${trimValue(process.env.VERCEL_PROJECT_PRODUCTION_URL)}` : '',
        process.env.VERCEL_URL ? `https://${trimValue(process.env.VERCEL_URL)}` : '',
    ].filter(Boolean);

    if (candidates.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
            return 'http://localhost:3000';
        }

        throw new Error(
            'Unable to resolve a public app URL. Set APP_BASE_URL or NEXT_PUBLIC_APP_URL for managed queue callbacks.',
        );
    }

    const canonical = candidates.find((value) => !isVercelHostedUrl(value)) ?? candidates[0];
    return normalizeUrl(canonical);
}

export function getWorkerEndpointUrl(pathname: string): string {
    const base = getPublicAppUrl();
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${base}${path}`;
}

export function getQstashClient(): Client {
    if (qstashClientSingleton) return qstashClientSingleton;

    const token = trimValue(process.env.QSTASH_TOKEN);
    if (!token || isPlaceholderValue(token)) {
        throw new Error('QSTASH_TOKEN is required for QUEUE_PROVIDER=qstash.');
    }

    qstashClientSingleton = new Client({ token });
    return qstashClientSingleton;
}

export function getQstashReceiver(): Receiver {
    if (qstashReceiverSingleton) return qstashReceiverSingleton;

    const currentSigningKey = trimValue(process.env.QSTASH_CURRENT_SIGNING_KEY);
    const nextSigningKey = trimValue(process.env.QSTASH_NEXT_SIGNING_KEY);

    if (
        !currentSigningKey ||
        !nextSigningKey ||
        isPlaceholderValue(currentSigningKey) ||
        isPlaceholderValue(nextSigningKey)
    ) {
        throw new Error(
            'QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY are required for signature verification.',
        );
    }

    qstashReceiverSingleton = new Receiver({
        currentSigningKey,
        nextSigningKey,
    });
    return qstashReceiverSingleton;
}

export async function verifyQstashRequestSignature(rawBody: string, signature: string): Promise<boolean> {
    const receiver = getQstashReceiver();
    return receiver.verify({
        signature,
        body: rawBody,
    });
}

export function getQstashRetries(): number {
    return Math.min(10, parsePositiveInt(process.env.QSTASH_MAX_DELIVERY_RETRIES, DEFAULT_QSTASH_RETRIES));
}

export function getQstashRetryDelayExpression(): string {
    const expression = trimValue(process.env.QSTASH_RETRY_DELAY);
    return expression || DEFAULT_QSTASH_RETRY_DELAY;
}

export function getQstashTimeoutSeconds(): number {
    return Math.min(900, parsePositiveInt(process.env.QSTASH_DELIVERY_TIMEOUT_SECONDS, DEFAULT_QSTASH_TIMEOUT_SECONDS));
}
