import { NextResponse, type NextRequest } from 'next/server';
import { enforceAccessControl } from '@/lib/proxy/access-control';
import { resolveLocalePath, setLocaleCookie } from '@/lib/proxy/locale';
import { applyRateLimitPolicy } from '@/lib/proxy/rate-limit-policy';
import { applySecurityHeaders, buildCsp, createNonce } from '@/lib/proxy/security-headers';

export async function proxy(request: NextRequest) {
    const nonce = createNonce();
    const localePath = resolveLocalePath(request.nextUrl.pathname);
    const pathname = localePath.strippedPathname;
    const csp = buildCsp(nonce, process.env.NODE_ENV === 'development');

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', csp);
    if (localePath.locale) {
        requestHeaders.set('x-locale', localePath.locale);
    }

    let response = localePath.locale
        ? NextResponse.rewrite(
            (() => {
                const url = request.nextUrl.clone();
                url.pathname = pathname;
                return url;
            })(),
            {
                request: {
                    headers: requestHeaders,
                },
            },
        )
        : NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    response = await enforceAccessControl({
        request,
        pathname,
        locale: localePath.locale,
        response,
    });
    response = await applyRateLimitPolicy({ request, pathname, response });
    applySecurityHeaders(response, csp);
    setLocaleCookie(response, localePath.locale);

    return response;
}

export const config = {
    matcher: [
        {
            source: '/((?!_next/static|_next/image|favicon.ico|icon.png|sitemap.xml|robots.txt).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
