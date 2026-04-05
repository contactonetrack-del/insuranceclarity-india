import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession();
        // Allow anonymous calculations, but don't save them.
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ success: true, message: 'Not logged in, calculation not saved' });
        }
        
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ success: true, message: 'No db user matched, calculation not saved' });
        }

        const body = await req.json();
        const { type, inputData, result } = body;

        if (!type || !inputData || !result) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const calculation = await prisma.userCalculation.create({
            data: {
                userId: user.id,
                type,
                inputData,
                result,
            }
        });

        return NextResponse.json({ success: true, data: calculation });
    } catch (error) {
        logger.error({ error, route: 'api/calculations' }, 'POST calculation failed');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const calculations = await prisma.userCalculation.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return NextResponse.json(calculations);
    } catch (error) {
         logger.error({ error, route: 'api/calculations' }, 'GET calculations failed');
         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
