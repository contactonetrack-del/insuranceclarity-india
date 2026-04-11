import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'hi'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async () => {
    // Basic locale negotiation (defaults to en)
    const cookieStore = await cookies();
    const headersList = await headers();
    
    let locale: SupportedLocale = 'en';

    // Priority 1: locale resolved by proxy from URL prefix
    const proxyLocale = headersList.get('x-locale')?.toLowerCase();
    if (proxyLocale && SUPPORTED_LOCALES.includes(proxyLocale as SupportedLocale)) {
        locale = proxyLocale as SupportedLocale;
    } else {
        // Check cookie next
        const localeCookie = cookieStore.get('NEXT_LOCALE');
        if (localeCookie?.value && SUPPORTED_LOCALES.includes(localeCookie.value as SupportedLocale)) {
            locale = localeCookie.value as SupportedLocale;
        } else {
            // Fallback to accept-language header
            const acceptLanguage = headersList.get('accept-language');
            if (acceptLanguage && acceptLanguage.includes('hi')) {
                locale = 'hi';
            }
        }
    }
    
    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});

