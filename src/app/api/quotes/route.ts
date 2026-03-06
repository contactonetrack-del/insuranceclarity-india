import { NextResponse } from 'next/server';
import { quoteService } from '../../../lib/services/quote.service';
import { ApiError } from '../../../lib/errors/api-error';

/**
 * Handle POST /api/quotes
 * Note how this routing controller contains NO business logic or DB calls.
 * It strictly acts as an HTTP Adapter in the Hexagonal Architecture.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await quoteService.generateQuote(body);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        // Map domain errors to standard HTTP RFC 7807 responses
        if (error instanceof ApiError) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }

        // Fallback for unexpected system errors
        console.error('[Quotes API Error]', error);
        return NextResponse.json(
            { type: 'about:blank', title: 'Internal Server Error', status: 500 },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const quotes = await quoteService.getAllQuotes();
        return NextResponse.json(quotes);
    } catch (error) {
        return NextResponse.json(
            { type: 'about:blank', title: 'Failed to retrieve quotes', status: 500 },
            { status: 500 }
        );
    }
}
