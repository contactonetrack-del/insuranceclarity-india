import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import { type SupportedLocale, withLocalePrefix } from '@/lib/proxy/locale';

function shouldProtectRoute(pathname: string): boolean {
    return pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/studio');
}

function isAdminRoute(pathname: string): boolean {
    return pathname.startsWith('/admin') || pathname.startsWith('/studio');
}

export async function enforceAccessControl(params: {
    request: NextRequest;
    pathname: string;
    locale: SupportedLocale | null;
    response: NextResponse;
}): Promise<NextResponse> {
    const { request, pathname, locale, response } = params;
    if (!shouldProtectRoute(pathname)) return response;

    const session = await auth(request.headers);
    if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = withLocalePrefix('/auth/signin', locale);
        url.searchParams.set('callbackUrl', withLocalePrefix(pathname, locale));
        return NextResponse.redirect(url);
    }

    if (isAdminRoute(pathname) && session.user.role !== 'ADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = withLocalePrefix('/dashboard', locale);
        return NextResponse.redirect(url);
    }

    return response;
}
