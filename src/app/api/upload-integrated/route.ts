import { NextRequest, NextResponse } from 'next/server';
import { POST as uploadPost } from '@/app/api/upload/route';
import { logger } from '@/lib/logger';

const SUCCESSOR_ENDPOINT = '/api/upload';
const SUNSET = 'Fri, 31 Jul 2026 23:59:59 GMT';

function withLegacyHeaders(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.set('Deprecation', 'true');
    headers.set('Sunset', SUNSET);
    headers.set('Link', `<${SUCCESSOR_ENDPOINT}>; rel="successor-version"`);
    headers.set('X-Legacy-Endpoint', SUCCESSOR_ENDPOINT);
    headers.set('Warning', `299 - "Deprecated API. Migrate to ${SUCCESSOR_ENDPOINT} before ${SUNSET}"`);
    headers.set('Cache-Control', 'no-store');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

export async function POST(request: NextRequest): Promise<Response> {
    logger.warn({
        action: 'api.legacy_endpoint_used',
        endpoint: '/api/upload-integrated',
        successor: SUCCESSOR_ENDPOINT,
    });

    return withLegacyHeaders(await uploadPost(request));
}

export async function GET(): Promise<Response> {
    return NextResponse.json(
        {
            error: 'This legacy endpoint has been removed. Use /api/upload.',
        },
        {
            status: 410,
            headers: {
                Deprecation: 'true',
                Sunset: SUNSET,
                Link: `<${SUCCESSOR_ENDPOINT}>; rel="successor-version"`,
                'X-Legacy-Endpoint': SUCCESSOR_ENDPOINT,
                Warning: `299 - "Deprecated API. Migrate to ${SUCCESSOR_ENDPOINT} before ${SUNSET}"`,
                'Cache-Control': 'no-store',
            },
        },
    );
}
