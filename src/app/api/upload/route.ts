/**
 * POST /api/upload
 *
 * Accepts a PDF file via multipart/form-data.
 * Validates → uploads to Cloudinary → creates Scan record → triggers inline AI analysis.
 *
 * Processing strategy:
 * - HTTP response returns scanId immediately after file upload
 * - AI analysis runs in the background (fire-and-forget)
 * - Client polls /api/result/[id]?status=true for completion
 *
 * Vercel timeout: 60s (configured in vercel.json)
 * Typical GPT analysis: 25-45s
 */

import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';

import { logger }                    from '@/lib/logger';
import { validatePdfBuffer } from '@/services/pdf.service';
import { extractTextFromPdf } from '@/services/pdf-extraction.server';
import { createScan, findExistingScan, countAnonymousScansSince } from '@/services/report.service';
import { enqueueScanJob }            from '@/lib/queue/scan-queue';
import { queue }                     from '@/lib/queue/jobs';
import { enforcePlanLimit }          from '@/lib/subscriptions/enforce-plan';
import { getLimitsForPlan }          from '@/lib/subscriptions/plan-limits';
import { enforceAiRateLimit }        from '@/lib/security/ai-rate-limit';
import { redisClient }               from '@/lib/cache/redis';
import { validateCsrfRequest }       from '@/lib/security/csrf';
import { sendScanLimitNudgeEmail }   from '@/services/email.service';
import { trackFunnelStep }           from '@/lib/analytics/funnel';
import type { UploadResponse }       from '@/types/report.types';

const ANONYMOUS_SCAN_LIMIT_PER_DAY = 3;
const AI_SCAN_RATE_LIMIT_PER_MINUTE_AUTH = 6;
const AI_SCAN_RATE_LIMIT_PER_MINUTE_ANON = 3;
const SCAN_PROCESSING_MODE = (process.env.SCAN_PROCESSING_MODE ?? 'worker').toLowerCase();

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

function getRequestLocale(request: NextRequest): 'en' | 'hi' {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
    if (cookieLocale === 'hi') return 'hi';
    if (cookieLocale === 'en') return 'en';

    const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
    return acceptLanguage.includes('hi') ? 'hi' : 'en';
}

async function maybeSendScanLimitNudge(params: {
    userId: string;
    email: string;
    userName?: string | null;
    plan?: string | null;
    locale: 'en' | 'hi';
}) {
    const dayKey = new Date().toISOString().slice(0, 10);
    const throttleKey = `nudge:scan-limit:${params.userId}:${dayKey}`;

    if (redisClient.isConfigured()) {
        const alreadySent = await redisClient.get<string>(throttleKey);
        if (alreadySent) {
            return;
        }
    }

    const normalizedPlan = (params.plan ?? 'FREE').toUpperCase();
    const limits = getLimitsForPlan(normalizedPlan);
    const monthlyLimit = Number.isFinite(limits.maxScansPerMonth)
        ? limits.maxScansPerMonth
        : undefined;

    sendScanLimitNudgeEmail(params.email, {
        userName: params.userName ?? 'there',
        plan: normalizedPlan,
        monthlyLimit,
        locale: params.locale,
    }).catch((err: unknown) => {
        logger.warn({
            action: 'upload.scan_limit_nudge.failed',
            userId: params.userId,
            error: String(err),
        });
    });

    if (redisClient.isConfigured()) {
        await redisClient.set(throttleKey, '1', { ex: 60 * 60 * 24 });
    }
}

// ─── Cloudinary Upload (Production SDK Integration) ───────────────────────────

/**
 * Configure Cloudinary SDK once.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
});

async function uploadToCloudinary(buffer: Buffer, fileName: string): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(
            'Cloudinary is not configured correctly for production storage.'
        );
    }

    try {
        // We use a Promise wrapping the upload_stream for efficient buffer handling in Node.js
        return await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'policy-scans',
                    resource_type: 'raw', // PDF is treated as raw
                    type: 'authenticated', // Restrict delivery
                    sign_url: true,       // Enforce signed URLs
                    public_id: fileName.replace(/\.[^/.]+$/, "") + "_" + Date.now(),
                    tags: ['insurance-policy', 'scan'],
                },
                (error, result) => {
                    if (error) {
                        logger.error({ action: 'cloudinary.upload.stream_error', error });
                        reject(new Error('Cloudinary storage stream failed.'));
                        return;
                    }
                    if (!result?.secure_url) {
                        reject(new Error('Cloudinary secure URL missing in response.'));
                        return;
                    }
                    resolve(result.secure_url);
                }
            );

            uploadStream.end(buffer);
        });
    } catch (error) {
        logger.error({
            action: 'cloudinary.upload.failed',
            fileName,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Document storage failed. Please try again later.');
    }
}

async function startScanProcessing(params: {
    scanId: string;
    extractedText: string;
    fileName: string;
    fileHash: string;
    userId?: string;
    locale?: 'en' | 'hi';
}): Promise<void> {
    const shouldUseWorker =
        SCAN_PROCESSING_MODE === 'worker' &&
        Boolean(process.env.QUEUE_SECRET);

    if (shouldUseWorker) {
        try {
            await queue.dispatch('PROCESS_SCAN_ANALYSIS', {
                scanId: params.scanId,
                fileName: params.fileName,
                fileHash: params.fileHash,
                userId: params.userId,
                locale: params.locale,
            });
            return;
        } catch (error) {
            logger.warn({
                action: 'upload.scan.dispatch.failed',
                scanId: params.scanId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    after(() => {
        enqueueScanJob({
            scanId: params.scanId,
            pdfText: params.extractedText,
            fileName: params.fileName,
            fileHash: params.fileHash,
            userId: params.userId,
            locale: params.locale,
        }).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error({ action: 'upload.process.failed', scanId: params.scanId, error: msg });
        });
    });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // 1. Validate CSRF Token
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        // 2. Get session (optional — allow anonymous uploads for first free scan)
        const session = await auth();
        const sessionUser = session?.user as {
            id?: string;
            email?: string | null;
            name?: string | null;
            plan?: string | null;
        } | undefined;
        const userId = sessionUser?.id ?? undefined;
        const ipAddress = getClientIp(request);
        const locale = getRequestLocale(request);

        const aiRateLimit = await enforceAiRateLimit({
            scope: 'scan-upload',
            limit: userId ? AI_SCAN_RATE_LIMIT_PER_MINUTE_AUTH : AI_SCAN_RATE_LIMIT_PER_MINUTE_ANON,
            windowSeconds: 60,
            userId,
            ipAddress,
        });
        if (!aiRateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many scan requests. Please wait a moment and try again.',
                    retryAfterSeconds: aiRateLimit.retryAfterSeconds,
                },
                { status: 429 },
            );
        }

        // 4. Enforce subscription plan limits for authenticated users
        if (userId) {
            const guard = await enforcePlanLimit(userId, 'scan');
            if (!guard.allowed) {
                if (sessionUser?.email) {
                    await maybeSendScanLimitNudge({
                        userId,
                        email: sessionUser.email,
                        userName: sessionUser.name,
                        plan: sessionUser.plan,
                        locale,
                    });
                }
                return NextResponse.json(
                    { error: guard.reason, upgradeUrl: guard.upgradeUrl },
                    { status: 402 },
                );
            }
        } else if (ipAddress) {
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const anonymousScans = await countAnonymousScansSince(ipAddress, since);

            if (anonymousScans >= ANONYMOUS_SCAN_LIMIT_PER_DAY) {
                return NextResponse.json(
                    {
                        error:
                            `You have reached the free anonymous scan limit (${ANONYMOUS_SCAN_LIMIT_PER_DAY}/day). ` +
                            'Sign in to continue scanning and unlock monthly plan limits.',
                        upgradeUrl: '/pricing',
                    },
                    { status: 402 },
                );
            }
        }

        // 4. Parse multipart form
        const formData = await request.formData();
        const file     = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided. Please upload a PDF.' },
                { status: 400 },
            );
        }

        // 5. Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer      = Buffer.from(arrayBuffer);
        const fileSizeKb  = Math.round(buffer.byteLength / 1024);

        // 6. Validate PDF (type, size, magic bytes)
        const validation = validatePdfBuffer(buffer, file.type, file.name);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // 7. Extract text and hash (used for deduplication + AI analysis)
        const { hash: fileHash, text: extractedText } = await extractTextFromPdf(buffer);

        // 8. Check for duplicate (user already scanned this exact document)
        const existingScanId = await findExistingScan(fileHash, { userId, ipAddress });
        if (existingScanId) {
            logger.info({ action: 'upload.dedup', fileHash, existingScanId });
            const response: UploadResponse = {
                scanId:    existingScanId,
                fileName:  file.name,
                fileSizeKb,
                message:   'Your policy was already scanned. Showing existing results.',
            };
            return NextResponse.json(response, { status: 200 });
        }

        // 9. Upload to Cloudinary (secure signed upload)
        const fileUrl = await uploadToCloudinary(buffer, file.name);

        // 10. Create Scan record in DB (status = PENDING)
        const scan = await createScan({
            userId,
            fileUrl,
            fileName:  file.name,
            fileHash,
            fileSizeKb,
            ipAddress: ipAddress ?? undefined,
        });

        void trackFunnelStep('scan', {
            userId: userId ?? null,
            scanId: scan.id,
        });

        // 11. Fire off AI analysis (non-blocking — client will poll for status)
        //     Prefer dedicated worker mode and fall back to inline queue for resilience.
        await startScanProcessing({
            scanId: scan.id,
            extractedText,
            fileName: file.name,
            fileHash,
            userId,
            locale,
        });

        logger.info({
            action:    'upload.success',
            scanId:    scan.id,
            fileName:  file.name,
            fileSizeKb,
            userId:    userId ?? 'anonymous',
        });

        const response: UploadResponse = {
            scanId:    scan.id,
            fileName:  file.name,
            fileSizeKb,
            message:   'Upload successful. Your policy is being analyzed.',
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        logger.error({ action: 'upload.error', error: message });

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
