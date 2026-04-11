import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { findDashboardUserByEmail } from '@/services/dashboard.service';

export async function requireDashboardUser() {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
        redirect('/');
    }

    const user = await findDashboardUserByEmail(email);

    if (!user) {
        redirect('/');
    }

    return { session, user };
}

