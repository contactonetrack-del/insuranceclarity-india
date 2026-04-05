/**
 * POST /api/newsletter
 *
 * Newsletter subscription endpoint.
 * Validates email, creates subscriber record, sends welcome email.
 * CSRF protected + Zod validated.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma }              from '@/lib/prisma';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { logger }              from '@/lib/logger';
import { sendWelcomeEmail }    from '@/services/email.service';
import { z }                   from 'zod';

const newsletterSchema = z.object({
    email:  z.string().email('Invalid email address'),
    name:   z.string().min(1).max(100).optional(),
    source: z.string().max(50).optional().default('footer'),
});

function getRequestLocale(req: NextRequest): 'en' | 'hi' {
    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
    if (cookieLocale === 'hi') return 'hi';
    if (cookieLocale === 'en') return 'en';

    const acceptLanguage = req.headers.get('accept-language')?.toLowerCase() ?? '';
    return acceptLanguage.includes('hi') ? 'hi' : 'en';
}

export async function POST(req: NextRequest) {
    try {
        // CSRF Protection
        const csrfError = validateCsrfRequest(req);
        if (csrfError) return csrfError;

        const body   = await req.json() as unknown;
        const parsed = newsletterSchema.parse(body);
        const locale = getRequestLocale(req);

        // Check for existing subscriber
        const existing = await prisma.lead.findFirst({
            where: { email: parsed.email, insuranceType: 'NEWSLETTER' },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'You are already subscribed!',
            });
        }

        // Create subscriber record (reusing Lead model as newsletter subscriber)
        await prisma.lead.create({
            data: {
                name:          parsed.name ?? parsed.email.split('@')[0],
                email:         parsed.email,
                phone:         'N/A',
                insuranceType: 'NEWSLETTER',
                source:        parsed.source as string,
                status:        'NEW',
            },
        });

        // Send welcome email (fire & forget — non-critical)
        sendWelcomeEmail(parsed.email, {
            userName: parsed.name ?? 'there',
            locale,
        }).catch(() => {
            logger.warn({ action: 'newsletter.welcome.failed', email: parsed.email });
        });

        logger.info({ action: 'newsletter.subscribed', email: parsed.email, source: parsed.source });

        return NextResponse.json({
            success: true,
            message: 'Subscribed successfully! Check your inbox for a welcome email.',
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: error.issues[0].message,
            }, { status: 400 });
        }
        logger.error({ action: 'newsletter.error', error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ success: false, message: 'Subscription failed. Please try again.' }, { status: 500 });
    }
}
