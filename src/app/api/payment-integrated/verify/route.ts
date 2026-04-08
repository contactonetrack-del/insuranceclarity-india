import { NextRequest } from 'next/server';
import { POST as verifyPaymentPost } from '@/app/api/payment/verify/route';
import { logger } from '@/lib/logger';

const SUCCESSOR_ENDPOINT = '/api/payment/verify';
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
        endpoint: '/api/payment-integrated/verify',
        successor: SUCCESSOR_ENDPOINT,
    });

    return withLegacyHeaders(await verifyPaymentPost(request));
}
