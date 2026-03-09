'use server';

import { prisma } from '@/lib/prisma';

export async function getAdminDashboardStats() {
    try {
        const totalQuotes = await prisma.quote.count();
        const quotes = await prisma.quote.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit to 100 most recent for performance
        });

        const totalPremium = quotes.reduce((acc: number, q: any) => acc + (q.premiumAmount || 0), 0);
        const totalCoverage = quotes.reduce((acc: number, q: any) => acc + (q.coverageAmount || 0), 0);

        return {
            totalQuotes,
            totalPremium,
            totalCoverage,
            recentQuotes: quotes,
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return { error: 'Failed to retrieve dashboard metrics' };
    }
}
