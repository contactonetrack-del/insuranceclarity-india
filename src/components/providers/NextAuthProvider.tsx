"use client";

import { AuthSessionProvider } from '@/lib/auth-client';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
