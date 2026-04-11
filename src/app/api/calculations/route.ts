import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { createSuccessResponse, ErrorFactory } from '@/lib/api/error-response';
import {
    createUserCalculation,
    findUserIdByEmail,
    listUserCalculationsByUserId,
} from '@/services/calculation.service';

export async function POST(req: NextRequest) {
    try {
        // Validate CSRF token for state-changing operations
        const csrfError = validateCsrfRequest(req);
        if (csrfError) return csrfError;

        const session = await getAuthSession();
        // Allow anonymous calculations, but don't save them.
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ success: true, message: 'Not logged in, calculation not saved' });
        }
        
        const user = await findUserIdByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ success: true, message: 'No db user matched, calculation not saved' });
        }

        const body = await req.json();
        const { type, inputData, result } = body;

        if (!type || !inputData || !result) {
            return ErrorFactory.validationError('Missing required calculation fields');
        }

        const calculation = await createUserCalculation({
            userId: user.id,
            type,
            inputData,
            result,
        });

        return createSuccessResponse(calculation, 201);
    } catch (error) {
        logger.error({ error, route: 'api/calculations' }, 'POST calculation failed');
        return ErrorFactory.internalServerError('Failed to save calculation');
    }
}

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session || !session.user || !session.user.email) {
            return ErrorFactory.unauthorized('Sign in to view your calculations');
        }

        const user = await findUserIdByEmail(session.user.email);
        if (!user) {
            return ErrorFactory.unauthorized('User account not found');
        }

        const calculations = await listUserCalculationsByUserId(user.id, 20);

        return createSuccessResponse(calculations);
    } catch (error) {
         logger.error({ error, route: 'api/calculations' }, 'GET calculations failed');
         return ErrorFactory.internalServerError('Failed to retrieve calculations');
    }
}
