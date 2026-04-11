'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const data = await res.json() as { csrfToken?: string };
        return data.csrfToken ?? null;
    } catch {
        return null;
    }
}

export default function UnsubscribePage() {
    const t = useTranslations('unsubscribePage');
    const searchParams = useSearchParams();
    const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);

    const [email, setEmail] = useState(initialEmail);
    const [reason, setReason] = useState('');
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitState('loading');
        setMessage('');

        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                throw new Error(t('status.securityTokenMissing'));
            }

            const res = await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                },
                body: JSON.stringify({
                    email: email.trim(),
                    reason: reason.trim() || undefined,
                    source: 'EMAIL_LINK',
                }),
            });

            const payload = await res.json() as { success?: boolean; message?: string; error?: string };
            if (!res.ok || !payload.success) {
                throw new Error(payload.error || t('status.unsubscribeFailed'));
            }

            setSubmitState('success');
            setMessage(payload.message || t('status.unsubscribed'));
        } catch (error) {
            setSubmitState('error');
            setMessage(error instanceof Error ? error.message : t('status.unsubscribeFailed'));
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
                <h1 className="text-2xl font-bold mb-3">{t('title')}</h1>
                <p className="text-slate-300 mb-6">
                    {t('description')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm mb-1 text-slate-300">{t('fields.emailLabel')}</label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-focus-ring/35"
                            placeholder={t('fields.emailPlaceholder')}
                        />
                    </div>

                    <div>
                        <label htmlFor="reason" className="block text-sm mb-1 text-slate-300">{t('fields.reasonLabel')}</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={300}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-focus-ring/35"
                            placeholder={t('fields.reasonPlaceholder')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitState === 'loading'}
                        className="inline-flex items-center rounded-lg bg-gradient-accent px-4 py-2 font-medium text-white shadow-[0_10px_24px_rgba(var(--token-accent-rgb),0.22)] hover:brightness-105 disabled:opacity-70"
                    >
                        {submitState === 'loading' ? t('actions.submitting') : t('actions.unsubscribe')}
                    </button>
                </form>

                {message ? (
                    <p
                        role="status"
                        className={`mt-4 text-sm ${submitState === 'success' ? 'text-success-500' : 'text-danger-500'}`}
                    >
                        {message}
                    </p>
                ) : null}
            </div>
        </main>
    );
}
