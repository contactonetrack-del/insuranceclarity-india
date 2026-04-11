'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    if (match) {
        return decodeURIComponent(match[1]);
    }

    try {
        const response = await fetch('/api/csrf');
        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as { csrfToken?: string };
        return data.csrfToken ?? null;
    } catch {
        return null;
    }
}

interface SignInPanelProps {
    callbackUrl: string;
    errorMessage?: string;
}

export default function SignInPanel({ callbackUrl, errorMessage }: SignInPanelProps) {
    const t = useTranslations('auditI18n.authPanel');
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpPending, setOtpPending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [message, setMessage] = useState(errorMessage ?? '');

    async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                throw new Error('Security token missing. Please refresh and try again.');
            }

            const response = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-csrf-token': csrfToken,
                },
                body: JSON.stringify({ email }),
            });

            const data = (await response.json()) as {
                error?: string | { message?: string };
            };

            if (!response.ok) {
                const nextMessage =
                    typeof data.error === 'string'
                        ? data.error
                        : data.error?.message || 'Failed to send OTP';

                throw new Error(nextMessage);
            }

            setOtpPending(true);
            setStatus('idle');
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Failed to send OTP');
        }
    }

    async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const result = await signIn('email-otp', {
                email,
                otp,
                redirect: false,
                callbackUrl,
            });

            if (!result.ok) {
                throw new Error(result.error || 'Invalid OTP code');
            }

            router.replace(result.url || callbackUrl);
            router.refresh();
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Invalid OTP code');
        }
    }

    async function handleGoogleSignIn() {
        setStatus('loading');
        setMessage('');

        const result = await signIn('google', { callbackUrl });

        if (!result.ok) {
            setStatus('error');
            setMessage(result.error || 'Unable to continue with Google right now.');
            return;
        }

        if (result.url && typeof window !== 'undefined') {
            window.location.assign(result.url);
        }
    }

    return (
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur dark:bg-slate-900/90">
            <div className="mb-8 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-lg shadow-accent/20">
                    <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent/80">
                        {t('secureAccess')}
                    </p>
                    <h1 className="font-display text-3xl font-bold text-theme-primary">
                        {t('title')}
                    </h1>
                    <p className="text-sm leading-6 text-theme-secondary">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={status === 'loading'}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    {t('continueWithGoogle')}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-semibold uppercase tracking-[0.25em] text-theme-muted dark:bg-slate-900">
                            {t('orEmailOtp')}
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={otpPending ? handleVerifyOtp : handleSendOtp}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label htmlFor="signin-email" className="text-sm font-medium text-theme-secondary">
                            {t('emailAddress')}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" />
                            <input
                                id="signin-email"
                                type="email"
                                autoComplete="email"
                                required
                                disabled={otpPending}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-theme-primary outline-none transition focus:border-accent dark:border-slate-700 dark:bg-slate-950"
                            />
                        </div>
                    </div>

                    {otpPending ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="signin-otp" className="text-sm font-medium text-theme-secondary">
                                    {t('otpCode')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpPending(false);
                                        setOtp('');
                                        setMessage('');
                                        setStatus('idle');
                                    }}
                                    className="text-xs font-semibold text-accent transition hover:underline"
                                >
                                    {t('changeEmail')}
                                </button>
                            </div>
                            <input
                                id="signin-otp"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="one-time-code"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] text-theme-primary outline-none transition focus:border-accent dark:border-slate-700 dark:bg-slate-950"
                            />
                        </div>
                    ) : null}

                    {message ? (
                        <p className={`text-sm ${status === 'error' ? 'text-rose-500' : 'text-theme-secondary'}`}>
                            {message}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>{otpPending ? t('verifyAndSignIn') : t('sendLoginCode')}</span>
                                <LogIn className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-xs leading-6 text-theme-muted">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="font-medium text-accent transition hover:underline">
                        {t('terms')}
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-accent transition hover:underline">
                        {t('privacyPolicy')}
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
