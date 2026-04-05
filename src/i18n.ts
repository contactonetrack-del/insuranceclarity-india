import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';

export default getRequestConfig(async () => {
    // Basic locale negotiation (defaults to en)
    const cookieStore = await cookies();
    const headersList = await headers();
    
    let locale = 'en';
    
    // Check cookie first
    const localeCookie = cookieStore.get('NEXT_LOCALE');
    if (localeCookie?.value && ['en', 'hi'].includes(localeCookie.value)) {
        locale = localeCookie.value;
    } else {
        // Fallback to accept-language header
        const acceptLanguage = headersList.get('accept-language');
        if (acceptLanguage && acceptLanguage.includes('hi')) {
            locale = 'hi';
        }
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});

