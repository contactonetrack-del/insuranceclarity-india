import { quoteRepository } from '../repositories/quote.repository';
import { quoteRequestSchema, QuoteRequest } from '../validations';
import { ApiError } from '../errors/api-error';
import { Prisma } from '@prisma/client';
import { logger } from '../logger';
import { queue } from '../queue/jobs';

export class QuoteService {
    /**
     * Processes a request for a new quote, validting the input and storing it.
     */
    async generateQuote(payload: unknown) {
        logger.info({ action: 'generateQuote', status: 'started' }, 'Initiating Quote Generation');
        // 1. Validate the Domain Input (Hexagonal Port)
        const result = quoteRequestSchema.safeParse(payload);

        if (!result.success) {
            throw new ApiError(
                'Invalid Quote Data',
                400,
                result.error.flatten(),
                'https://api.insuranceclarity.com/errors/validation'
            );
        }

        const validatedData = result.data;

        // 2. Business Logic Execution
        // In reality, this might involve calling an external pricing engine
        // or calculating the premium based on the coverage parameters.
        const calculatedPremium = this.calculateBasePremium(validatedData);

        // 3. Persist via Repository (Hexagonal Adapter)
        try {
            const quoteData: Prisma.QuoteCreateInput | any = {
                insuranceType: validatedData.insuranceType,
                coverageAmount: validatedData.coverageAmount,
                applicantAge: validatedData.applicantAge,
                tobaccoUser: validatedData.tobaccoUser,
                premiumAmount: calculatedPremium,
                status: 'PENDING',
            };

            const savedQuote = await quoteRepository.create(quoteData);

            // 4. FIRE AND FORGET - Offload heavy PDF policy generation to Background Queue
            // This prevents Node.js thread blocking and OOM errors during high concurrency
            const trackingJobId = await queue.dispatch('GENERATE_QUOTE_DOCUMENT', {
                quoteId: savedQuote.id,
                templateId: 'TERM_LIFE', // Dynamic based on insuranceType in reality
                customerEmail: 'customer@example.com' // Mock
            });

            logger.info({ action: 'generateQuote', status: 'success', quoteId: savedQuote.id, trackingJobId });

            return {
                quote: savedQuote,
                documentJobId: trackingJobId, // UI can poll this ID via SSE or websockets
                status: 'PROCESSING_DOCUMENT'
            };
        } catch (error) {
            logger.error({ action: 'generateQuote', status: 'persistence_failed', error });
            throw new ApiError('Failed to persist quote generation', 500);
        }
    }

    async getAllQuotes() {
        return quoteRepository.findAll();
    }

    async getQuoteById(id: string) {
        return quoteRepository.findById(id);
    }

    /**
     * Mock pricing engine logic
     */
    private calculateBasePremium(data: QuoteRequest): number {
        let base = data.coverageAmount * 0.001; // $1 per $1,000 coverage
        if (data.tobaccoUser) base *= 1.5;
        if (data.applicantAge > 50) base *= 1.2;
        return Math.round(base * 100) / 100;
    }
}

export const quoteService = new QuoteService();
