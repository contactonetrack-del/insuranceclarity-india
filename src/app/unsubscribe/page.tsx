'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export default function UnsubscribePage() {
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
            const res = await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    reason: reason.trim() || undefined,
                    source: 'EMAIL_LINK',
                }),
            });

            const payload = await res.json() as { success?: boolean; message?: string; error?: string };
            if (!res.ok || !payload.success) {
                throw new Error(payload.error || 'Unsubscribe failed.');
            }

            setSubmitState('success');
            setMessage(payload.message || 'You have been unsubscribed.');
        } catch (error) {
            setSubmitState('error');
            setMessage(error instanceof Error ? error.message : 'Unsubscribe failed.');
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
                <h1 className="text-2xl font-bold mb-3">Unsubscribe from Emails</h1>
                <p className="text-slate-300 mb-6">
                    Enter your email address to stop receiving Insurance Clarity emails.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm mb-1 text-slate-300">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="reason" className="block text-sm mb-1 text-slate-300">Reason (optional)</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={300}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="Tell us why (optional)"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitState === 'loading'}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 disabled:opacity-70"
                    >
                        {submitState === 'loading' ? 'Submitting...' : 'Unsubscribe'}
                    </button>
                </form>

                {message ? (
                    <p
                        role="status"
                        className={`mt-4 text-sm ${submitState === 'success' ? 'text-emerald-300' : 'text-red-300'}`}
                    >
                        {message}
                    </p>
                ) : null}
            </div>
        </main>
    );
}
