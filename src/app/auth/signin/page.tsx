import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SignInPanel from '@/components/auth/SignInPanel';
import { sanitizeRelativeCallbackUrl } from '@/lib/auth/callback-url';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auditI18n.authSignInPage');

    return {
        title: t('metadataTitle'),
        description: t('metadataDescription'),
    };
}

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

interface SignInPageProps {
    searchParams?: Promise<SearchParams>;
}

function firstValue(value: SearchParamValue): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(error?: string): string | undefined {
    switch (error) {
        case 'AccessDenied':
            return 'You do not have permission to access that area.';
        default:
            return undefined;
    }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const callbackUrl = sanitizeRelativeCallbackUrl(
        firstValue(resolvedSearchParams.callbackUrl),
        '/dashboard',
    );

    const session = await auth();
    if (session) {
        redirect(callbackUrl);
    }

    const errorMessage = getErrorMessage(firstValue(resolvedSearchParams.error));

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--token-semantic-success),0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(var(--token-semantic-info),0.18),transparent_30%)]" />
            <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
                <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <section className="space-y-8 text-white">
                        <div className="space-y-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent/80">
                                Account Security
                            </p>
                            <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
                                Secure access for dashboards, reports, and premium insurance workflows.
                            </h1>
                            <p className="max-w-xl text-base leading-7 text-slate-300">
                                Use Google or a one-time email code. Sessions are backed by Better Auth,
                                Postgres, and hardened rate limiting.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                                    Stronger Sessions
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Database-backed sessions, OTP attempt tracking, and centralized security
                                    controls replace the old beta auth flow.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                                    Fast Recovery
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Email OTP sign-in works without passwords and keeps the sign-in journey short
                                    for returning users.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            <Link href="/" className="font-medium text-accent transition hover:underline">
                                Back to home
                            </Link>
                            <Link href="/dashboard" className="font-medium text-accent transition hover:underline">
                                Dashboard overview
                            </Link>
                        </div>
                    </section>

                    <SignInPanel callbackUrl={callbackUrl} errorMessage={errorMessage} />
                </div>
            </div>
        </main>
    );
}
