import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { enforcePlanLimit } from '@/lib/subscriptions/enforce-plan';
import { validateCsrfRequest } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

const MAX_BULK_FILES = 10;

export async function POST(request: NextRequest) {
    const csrfError = validateCsrfRequest(request);
    if (csrfError) return csrfError;

    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Please sign in to use bulk scan.' }, { status: 401 });
    }

    const access = await enforcePlanLimit(userId, 'bulkScan');
    if (!access.allowed) {
        return NextResponse.json(
            { error: access.reason ?? 'Bulk scan is not enabled for this account.', upgradeUrl: access.upgradeUrl },
            { status: 402 },
        );
    }

    const formData = await request.formData();
    const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

    if (files.length < 2) {
        return NextResponse.json({ error: 'Upload at least 2 PDF files for bulk scan.' }, { status: 400 });
    }

    if (files.length > MAX_BULK_FILES) {
        return NextResponse.json({ error: `Bulk scan accepts up to ${MAX_BULK_FILES} files per request.` }, { status: 400 });
    }

    const csrfToken = request.headers.get('x-csrf-token') ?? '';
    const cookieHeader = request.headers.get('cookie') ?? '';
    const uploadUrl = new URL('/api/upload', request.url);

    const results: Array<{
        fileName: string;
        ok: boolean;
        scanId?: string;
        message?: string;
        error?: string;
    }> = [];

    for (const file of files) {
        const single = new FormData();
        single.append('file', file);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
            },
            body: single,
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            results.push({
                fileName: file.name,
                ok: false,
                error: typeof body?.error === 'string' ? body.error : `Upload failed (${response.status})`,
            });
            continue;
        }

        results.push({
            fileName: file.name,
            ok: true,
            scanId: typeof body?.scanId === 'string' ? body.scanId : undefined,
            message: typeof body?.message === 'string' ? body.message : 'Queued for analysis.',
        });
    }

    const successCount = results.filter((r) => r.ok).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
        successCount,
        failureCount,
        results,
    });
}
