import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/api/error-response';

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

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        
        if (!user) {
            return ErrorFactory.notFound('User not found');
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const history = await prisma.chatHistory.findUnique({
                where: { id, userId: user.id }
            });
            return NextResponse.json(history);
        }

        const histories = await prisma.chatHistory.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            }
        });

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

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        
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
            const updated = await prisma.chatHistory.update({
                where: { id, userId: user.id },
                data: {
                    title,
                    messages: messages as unknown as any, // Json in Prisma is tricky without a schema, but this is better than raw any
                }
            });
            return NextResponse.json({ id: updated.id });
        } else {
            // Create new session
            const created = await prisma.chatHistory.create({
                data: {
                    userId: user.id,
                    title,
                    messages: messages as unknown as any,
                }
            });
            return NextResponse.json({ id: created.id });
        }
    } catch (error) {
        logger.error({ error, route: 'api/advisor/history' }, 'Failed to save chat history');
        return ErrorFactory.internalServerError('Internal server error');
    }
}
