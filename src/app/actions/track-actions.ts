'use server';

import { quoteService } from '@/services/quote.service';

export async function fetchQuoteStatus(quoteId: string) {
    if (!quoteId) {
        return { error: 'Please provide a valid Quote ID or Tracking ID.' };
    }

    try {
        if (quoteId.startsWith('POL-')) {
            return {
                quote: {
                    id: quoteId,
                    insuranceType: 'Demonstration Policy',
                    coverageAmount: 5000000,
                    premiumAmount: 1560,
                    status: 'READY',
                    createdAt: new Date(),
                }
            };
        }

        const quote = await quoteService.getQuoteById(quoteId);
        if (!quote) {
            return { error: 'Quote not found in our system. Please check the ID.' };
        }

        return { quote };
    } catch (error) {
        console.error('Failed to fetch quote:', error);
        return { error: 'Internal system error while retrieving quote.' };
    }
}
