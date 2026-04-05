import { NextRequest, NextResponse } from 'next/server';
import { sendContactAlert, sendWelcomeEmail } from '@/services/email.service';
import { logger }              from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { z }                   from 'zod';

const contactSchema = z.object({
    name:    z.string().min(2, 'Name must be at least 2 characters').max(100),
    email:   z.string().email('Invalid email address'),
    subject: z.string().min(2).max(200).optional().default('General Inquiry'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
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
        const parsed = contactSchema.parse(body);
        const locale = getRequestLocale(req);

        // Alert admin (fire & forget — non-blocking)
        sendContactAlert({
            name:    parsed.name,
            email:   parsed.email,
            subject: parsed.subject,
            message: parsed.message,
        }).catch(() => { /* non-fatal */ });

        // Send confirmation to user (fire & forget)
        sendWelcomeEmail(parsed.email, { userName: parsed.name, locale })
            .catch(() => { /* non-fatal */ });

        logger.info({ action: 'contact.sent', email: parsed.email });
        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        logger.error({ action: 'contact.error', error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error processing contact form' }, { status: 500 });
    }
}
