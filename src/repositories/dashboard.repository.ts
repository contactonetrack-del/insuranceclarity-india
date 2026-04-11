import { logDbQuery, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class DashboardRepository {
    async findDashboardUserByEmail(email: string) {
        const start = Date.now();
        try {
            const result = await prisma.user.findUnique({
                where: { email },
                include: {
                    savedQuotes: { orderBy: { createdAt: 'desc' }, take: 3 },
                    scans: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                        include: { report: true },
                    },
                    calculations: {
                        orderBy: { createdAt: 'desc' },
                        take: 4,
                    },
                    _count: { select: { savedQuotes: true, calculations: true } },
                },
            });
            logDbQuery('User', 'findDashboardUserByEmail', Date.now() - start, { email });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findDashboardUserByEmail', model: 'User', email },
                'Repository Error: User.findDashboardUserByEmail',
            );
            throw error;
        }
    }

    async findUserByEmail(email: string) {
        const start = Date.now();
        try {
            const result = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    plan: true,
                    scansUsed: true,
                    createdAt: true,
                    planExpiresAt: true,
                },
            });
            logDbQuery('User', 'findUserByEmail', Date.now() - start, { email });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findUserByEmail', model: 'User', email },
                'Repository Error: User.findUserByEmail',
            );
            throw error;
        }
    }

    async listScansByUserId(userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.scan.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: { report: { select: { risks: true } } },
            });
            logDbQuery('Scan', 'listScansByUserId', Date.now() - start, { userId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'listScansByUserId', model: 'Scan', userId },
                'Repository Error: Scan.listScansByUserId',
            );
            throw error;
        }
    }

    async listQuotesByUserId(userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.savedQuote.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            logDbQuery('SavedQuote', 'listQuotesByUserId', Date.now() - start, { userId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'listQuotesByUserId', model: 'SavedQuote', userId },
                'Repository Error: SavedQuote.listQuotesByUserId',
            );
            throw error;
        }
    }

    async listCalculationsByUserId(userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.userCalculation.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
            logDbQuery('UserCalculation', 'listCalculationsByUserId', Date.now() - start, { userId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'listCalculationsByUserId', model: 'UserCalculation', userId },
                'Repository Error: UserCalculation.listCalculationsByUserId',
            );
            throw error;
        }
    }

    async getDashboardCountsByUserId(userId: string) {
        const start = Date.now();
        try {
            const [scanCount, quoteCount, calcCount] = await Promise.all([
                prisma.scan.count({ where: { userId } }),
                prisma.savedQuote.count({ where: { userId } }),
                prisma.userCalculation.count({ where: { userId } }),
            ]);

            logDbQuery('Dashboard', 'getDashboardCountsByUserId', Date.now() - start, { userId });
            return { scanCount, quoteCount, calcCount };
        } catch (error) {
            logger.error(
                { error, action: 'getDashboardCountsByUserId', model: 'Dashboard', userId },
                'Repository Error: Dashboard.getDashboardCountsByUserId',
            );
            throw error;
        }
    }
}

export const dashboardRepository = new DashboardRepository();
