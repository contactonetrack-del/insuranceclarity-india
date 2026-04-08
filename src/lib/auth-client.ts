'use client';

import {
    SessionProvider,
    signIn as nextAuthSignIn,
    signOut as nextAuthSignOut,
    useSession,
} from 'next-auth/react';

export const AuthSessionProvider = SessionProvider;
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;
export const useAuthSession = useSession;
