'use client';

/**
 * NewsletterSignup.tsx
 *
 * Email capture component with CSRF protection, validation, and success state.
 * Designed for footer, homepage, and blog sidebars.
 */

import { useState, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const data = await res.json() as { csrfToken: string };
        return data.csrfToken;
    } catch {
        return null;
    }
}

interface NewsletterSignupProps {
    source?: string;
    title?: string;
    subtitle?: string;
    compact?: boolean;
}

export default function NewsletterSignup({
    source = 'footer',
    title = 'Insurance tips, decoded weekly.',
    subtitle = 'No jargon. No spam. Unsubscribe anytime.',
    compact = false,
}: NewsletterSignupProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    useEffect(() => {
        getCsrfToken().then(setCsrfToken);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
                },
                body: JSON.stringify({ email, source }),
            });

            const data = await res.json() as { success: boolean; message: string };

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Subscription failed');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={`newsletter-success ${compact ? 'newsletter-success--compact' : ''}`} role="status">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                <div>
                    <p className="newsletter-success__title">You&apos;re subscribed! 🎉</p>
                    <p className="newsletter-success__desc">Check your inbox for a welcome email.</p>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <form onSubmit={handleSubmit} className="newsletter-compact" aria-label="Newsletter signup">
                <label htmlFor="newsletter-email-compact" className="sr-only">Email address</label>
                <input
                    id="newsletter-email-compact"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="newsletter-compact__input input"
                    required
                    aria-describedby={error ? 'newsletter-error' : undefined}
                />
                <button type="submit" disabled={loading} className="btn-primary newsletter-compact__btn">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>
                {error && <p id="newsletter-error" className="newsletter-error" role="alert">{error}</p>}
            </form>
        );
    }

    return (
        <div className="newsletter-signup">
            <div className="newsletter-signup__icon" aria-hidden="true">
                <Mail className="w-7 h-7" />
            </div>
            <h3 className="newsletter-signup__title">{title}</h3>
            <p className="newsletter-signup__subtitle">{subtitle}</p>

            <form onSubmit={handleSubmit} className="newsletter-signup__form" aria-label="Newsletter signup form">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input newsletter-signup__input"
                    required
                    aria-describedby={error ? 'newsletter-error-main' : undefined}
                />
                <button type="submit" disabled={loading} className="btn-primary newsletter-signup__btn">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            Subscribing…
                        </>
                    ) : (
                        <>
                            Subscribe
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                    )}
                </button>
                {error && <p id="newsletter-error-main" className="newsletter-error mt-2" role="alert">{error}</p>}
            </form>

            <p className="newsletter-signup__legal">
                By subscribing you agree to our{' '}
                <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
        </div>
    );
}
