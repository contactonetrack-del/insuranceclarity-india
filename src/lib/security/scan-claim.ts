import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from '@/lib/logger';
import { isPlaceholderValue } from '@/lib/security/env';
import { redisClient } from '@/lib/cache/redis';

const SCAN_CLAIM_TTL_SECONDS = 60 * 60 * 24;
const scanClaimBaseSecret =
    process.env.SCAN_CLAIM_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    '';

if (!scanClaimBaseSecret) {
    const message = 'SCAN_CLAIM_SECRET (or BETTER_AUTH_SECRET fallback) is not configured.';
    if (process.env.NODE_ENV === 'production') {
        throw new Error(message);
    }

    logger.warn({ action: 'scan_claim.secret.missing', message });
}

if (process.env.NODE_ENV === 'production' && isPlaceholderValue(scanClaimBaseSecret)) {
    throw new Error('SCAN_CLAIM_SECRET is placeholder-like in production. Set a strong random secret.');
}

const SCAN_CLAIM_SECRET = scanClaimBaseSecret || 'dev-only-scan-claim-secret';

interface ScanClaimPayload {
    scanId: string;
    exp: number;
}

function toBase64Url(value: string): string {
    return Buffer.from(value, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (normalized.length % 4 || 4)) % 4;
    return Buffer.from(`${normalized}${'='.repeat(padding)}`, 'base64').toString('utf8');
}

function signPayload(payload: string): string {
    return createHmac('sha256', SCAN_CLAIM_SECRET)
        .update(payload)
        .digest('hex');
}

export function generateScanClaimToken(scanId: string, ttlSeconds = SCAN_CLAIM_TTL_SECONDS): string {
    const payload: ScanClaimPayload = {
        scanId,
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    };
    const payloadString = JSON.stringify(payload);
    const payloadEncoded = toBase64Url(payloadString);
    const signature = signPayload(payloadEncoded);
    return `${payloadEncoded}.${signature}`;
}

function safeEqualHex(a: string, b: string): boolean {
    try {
        const left = Buffer.from(a, 'hex');
        const right = Buffer.from(b, 'hex');
        if (left.length !== right.length) {
            return false;
        }

        return timingSafeEqual(left, right);
    } catch {
        return false;
    }
}

export function verifySignedScanClaimToken(token: string | null | undefined, expectedScanId: string): boolean {
    if (!token) {
        return false;
    }

    const [payloadEncoded, signature] = token.split('.');
    if (!payloadEncoded || !signature) {
        return false;
    }

    const expectedSignature = signPayload(payloadEncoded);
    if (!safeEqualHex(signature, expectedSignature)) {
        return false;
    }

    try {
        const payload = JSON.parse(fromBase64Url(payloadEncoded)) as ScanClaimPayload;
        const now = Math.floor(Date.now() / 1000);
        return payload.scanId === expectedScanId && payload.exp > now;
    } catch {
        return false;
    }
}

export async function verifyScanClaimToken(token: string | null | undefined, expectedScanId: string): Promise<boolean> {
    if (!token) {
        return false;
    }

    if (verifySignedScanClaimToken(token, expectedScanId)) {
        return true;
    }

    if (!redisClient.isConfigured()) {
        return false;
    }

    const claimedScanId = await redisClient.get<string>(`scan:claim:${token}`);
    return claimedScanId === expectedScanId;
}
