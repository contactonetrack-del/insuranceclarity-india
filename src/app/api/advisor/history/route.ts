import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/api/error-response';
import {
    createAdvisorHistory,
    findAdvisorHistoryById,
    findUserIdByEmail,
    listAdvisorHistories,
    updateAdvisorHistory,
} from '@/services/advisor-history.service';

/**
 * GET /api/advisor/history
 * Fetch all chat sessions or a specific one by ID.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session || !session.user || !session.user.email) {
            return ErrorFactory.unauthorized('Unauthorized');
        }

        const user = await findUserIdByEmail(session.user.email);
        
        if (!user) {
            return ErrorFactory.notFound('User not found');
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const history = await findAdvisorHistoryById(id, user.id);
            return NextResponse.json(history);
        }

        const histories = await listAdvisorHistories(user.id);

        return NextResponse.json(histories);
    } catch (error) {
        logger.error({ error, route: 'api/advisor/history' }, 'Failed to fetch chat history');
        return ErrorFactory.internalServerError('Internal server error');
    }
}

/**
 * POST /api/advisor/history
 * Save or update a chat session.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session || !session.user || !session.user.email) {
            return ErrorFactory.unauthorized('Unauthorized');
        }

        const user = await findUserIdByEmail(session.user.email);
        
        if (!user) {
            return ErrorFactory.notFound('User not found');
        }

        const body = await req.json();
        const { id, title, messages } = body;

        if (!title || !messages || !Array.isArray(messages)) {
            return ErrorFactory.validationError('Missing required fields');
        }

        if (id) {
            // Update existing session
            const updated = await updateAdvisorHistory({
                id,
                userId: user.id,
                title,
                messages,
            });
            return NextResponse.json({ id: updated.id });
        } else {
            // Create new session
            const created = await createAdvisorHistory({
                userId: user.id,
                title,
                messages,
            });
            return NextResponse.json({ id: created.id });
        }
    } catch (error) {
        logger.error({ error, route: 'api/advisor/history' }, 'Failed to save chat history');
        return ErrorFactory.internalServerError('Internal server error');
    }
}
