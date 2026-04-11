import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ErrorFactory } from '@/lib/api/error-response';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return ErrorFactory.unauthorized('Unauthorized');
        }

        return NextResponse.json({
            user: session.user,
            message: 'You have accessed a protected route.',
        });
    } catch {
        return ErrorFactory.internalServerError('Internal Server Error');
    }
}
