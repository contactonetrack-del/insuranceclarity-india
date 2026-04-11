import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { handleValidationError, ErrorFactory, createSuccessResponse } from '@/lib/api/error-response';
import { deriveLeadSource } from '@/lib/domain/enums';
import { createLead } from '@/services/engagement.service';

const leadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be valid'),
    insuranceType: z.string().min(2, 'Insurance type is required'),
    source: z.string().optional(),
    sourceUrl: z.string().optional(),
});

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

export async function POST(req: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ipAddress = getClientIp(req);

        // Rate limiting: 5 leads per hour per IP
        const rateLimit = await enforceRateLimit({
            scope: 'leads',
            limit: 5,
            windowSeconds: 60 * 60, // 1 hour
            ipAddress,
        });

        if (!rateLimit.allowed) {
            return ErrorFactory.rateLimitExceeded('Too many lead submissions. Please try again later.', {
                retryAfterSeconds: rateLimit.retryAfterSeconds,
            });
        }

        // CSRF Protection
        const csrfError = validateCsrfRequest(req);
        if (csrfError) return csrfError;

        const body = await req.json();
        const validatedData = leadSchema.parse(body);
        const source = deriveLeadSource({
            source: validatedData.source,
            sourceUrl: validatedData.sourceUrl,
        });
        const sourceContext = [validatedData.source, validatedData.sourceUrl]
            .filter((value): value is string => Boolean(value?.trim()))
            .join(' | ');

        const lead = await createLead({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            insuranceType: validatedData.insuranceType,
            source,
            status: 'NEW',
            ...(sourceContext ? { notes: `Source context: ${sourceContext}` } : {}),
        });

        logger.info({ action: 'createLead', status: 'success', leadId: lead.id, type: lead.insuranceType });

        return createSuccessResponse({ leadId: lead.id }, 201);

    } catch (error) {
        logger.error({ action: 'createLead', status: 'failed', error: error instanceof Error ? error.message : String(error) });

        if (error instanceof z.ZodError) {
            return handleValidationError(error);
        }

        return ErrorFactory.internalServerError('Failed to process lead submission');
    }
}
