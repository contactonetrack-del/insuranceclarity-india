/**
 * POST /api/scan/notify
 *
 * Stores a "notify me when scan is ready" request for a specific scan.
 * The queue processor sends the email after analysis completes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';

const notifySchema = z.object({
    scanId: z.string().min(1).max(100),
    email: z.string().email(),
    name: z.string().min(1).max(120).optional(),
});

function getRequestLocale(request: NextRequest): 'en' | 'hi' {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
    if (cookieLocale === 'hi') return 'hi';
    if (cookieLocale === 'en') return 'en';

    const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
    return acceptLanguage.includes('hi') ? 'hi' : 'en';
}

export async function POST(request: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        const json = await request.json() as unknown;
        const parsed = notifySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request payload' },
                { status: 400 },
            );
        }

        const { scanId } = parsed.data;
        const email = parsed.data.email.trim().toLowerCase();
        const locale = getRequestLocale(request);
        const session = await auth();
        const sessionName = (session?.user as { name?: string | null } | undefined)?.name;
        const contactName = parsed.data.name?.trim() || sessionName || email.split('@')[0] || 'there';

        const existing = await prisma.lead.findFirst({
            where: {
                email,
                insuranceType: 'SCAN_NOTIFY',
                notes: `scan:${scanId}`,
            },
            select: { id: true },
        });

        if (!existing) {
            await prisma.lead.create({
                data: {
                    name: contactName,
                    email,
                    phone: 'N/A',
                    insuranceType: 'SCAN_NOTIFY',
                    source: `scan_notify_${locale}`,
                    status: 'NEW',
                    notes: `scan:${scanId}`,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: locale === 'hi'
                ? 'स्कैन पूरा होते ही हम आपको ईमेल भेज देंगे।'
                : 'We will email you as soon as your scan is ready.',
        });
    } catch (error) {
        logger.error({
            action: 'scan.notify.error',
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { success: false, error: 'Failed to save notification request.' },
            { status: 500 },
        );
    }
}
