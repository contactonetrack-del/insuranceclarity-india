import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface CronAuthOptions {
    action: string;
    secretEnvVar?: string;
}

function timingSafeStringEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
}

function getAuthorizationToken(request: Request): string {
    const header = request.headers.get('authorization')?.trim();
    if (!header || !header.startsWith('Bearer ')) {
        return '';
    }

    return header.slice('Bearer '.length).trim();
}

export function requireCronAuthorization(
    request: Request,
    { action, secretEnvVar = 'CRON_SECRET' }: CronAuthOptions,
): NextResponse | null {
    const configuredSecret = process.env[secretEnvVar]?.trim() ?? '';
    if (!configuredSecret) {
        logger.error({
            action: `${action}.misconfigured`,
            secretEnvVar,
        });
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const token = getAuthorizationToken(request);
    if (!token || !timingSafeStringEqual(token, configuredSecret)) {
        logger.warn({
            action: `${action}.unauthorized`,
            ip: request.headers.get('x-forwarded-for') ?? null,
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null;
}
