import { NextResponse } from 'next/server';

export type SupportedLocale = 'en' | 'hi';
const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'hi'];

export function withLocalePrefix(pathname: string, locale: SupportedLocale | null): string {
    if (!locale) return pathname;
    const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `/${locale}${normalized}`;
}

export function resolveLocalePath(pathname: string): { locale: SupportedLocale | null; strippedPathname: string } {
    const localePrefix = pathname.match(/^\/([a-z]{2})(?=\/|$)/i)?.[1]?.toLowerCase();
    if (!localePrefix || !SUPPORTED_LOCALES.includes(localePrefix as SupportedLocale)) {
        return { locale: null, strippedPathname: pathname };
    }
    const prefix = `/${localePrefix}`;
    const stripped = pathname.slice(prefix.length) || '/';
    return {
        locale: localePrefix as SupportedLocale,
        strippedPathname: stripped.startsWith('/') ? stripped : `/${stripped}`,
    };
}

export function setLocaleCookie(response: NextResponse, locale: SupportedLocale | null): void {
    if (!locale) return;
    response.cookies.set('NEXT_LOCALE', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
    });
}
