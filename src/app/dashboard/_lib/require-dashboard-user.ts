import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

export async function requireDashboardUser() {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
        redirect('/');
    }

    const user = await prisma.user.findUnique({
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

    if (!user) {
        redirect('/');
    }

    return { session, user };
}

