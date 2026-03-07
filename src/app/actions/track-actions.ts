'use server';

import { quoteService } from '../../lib/services/quote.service';

export async function fetchQuoteStatus(quoteId: string) {
    if (!quoteId) {
        return { error: 'Please provide a valid Quote ID or Tracking ID.' };
    }

    try {
        const quote = await quoteService.getQuoteById(quoteId);
        if (!quote) {
            // Because our mock UI generates POL-12345, we might return a mock payload
            // if we don't find the real UUID in the database, just so the demo works smoothly.
            if (quoteId.startsWith('POL-')) {
                return {
                    quote: {
                        id: quoteId,
                        insuranceType: 'Mock Policy',
                        coverageAmount: 0,
                        premiumAmount: 0,
                        status: 'PROCESSING_DOCUMENT',
                        createdAt: new Date(),
                    }
                };
            }
            return { error: 'Quote not found in our system. Please check the ID.' };
        }

        return { quote };
    } catch (error) {
        console.error('Failed to fetch quote:', error);
        return { error: 'Internal system error while retrieving quote.' };
    }
}
