'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

type State = 'idle' | 'saving' | 'done' | 'error'

export default function ReferPage() {
    const t = useTranslations('refer')
    const params = useSearchParams()
    const code = useMemo(() => params.get('code')?.trim() ?? '', [params])

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [state, setState] = useState<State>('idle')
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!code) return
        void fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'visit', code }),
        })
    }, [code])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!code) return

        setState('saving')
        setMessage(null)

        try {
            const response = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, name, email, phone }),
            })
            const body = await response.json().catch(() => ({} as { error?: string }))
            if (!response.ok) {
                throw new Error(body.error ?? t('errors.submitFailed'))
            }

            setState('done')
            setMessage(t('messages.success'))
        } catch (error) {
            setState('error')
            setMessage(error instanceof Error ? error.message : t('errors.submitFailed'))
        }
    }

    if (!code) {
        return (
            <main className="min-h-screen pt-24 px-6">
                <div className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
                    {t('missingCode')}
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pt-24 px-6 pb-12">
            <div className="mx-auto max-w-xl space-y-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t('badge')}</p>
                    <h1 className="mt-1 text-3xl font-bold text-theme-primary">{t('title')}</h1>
                    <p className="mt-2 text-sm text-theme-secondary">
                        {t('subtitlePrefix')} <span className="font-semibold">{code}</span>. {t('subtitleSuffix')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="glass-strong rounded-2xl border border-default p-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-primary" htmlFor="refer-name">{t('fields.name.label')}</label>
                        <input
                            id="refer-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-default px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-primary" htmlFor="refer-email">{t('fields.email.label')}</label>
                        <input
                            id="refer-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-default px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-primary" htmlFor="refer-phone">{t('fields.phone.label')}</label>
                        <input
                            id="refer-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-lg border border-default px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={state === 'saving' || state === 'done'}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {state === 'saving' ? t('actions.submitting') : state === 'done' ? t('actions.submitted') : t('actions.submit')}
                    </button>
                </form>

                {message && (
                    <div
                        className={`rounded-lg border p-3 text-sm ${state === 'error'
                            ? 'border-danger-500/25 bg-danger-500/10 text-danger-500'
                            : 'border-success-500/25 bg-success-500/10 text-success-500'
                            }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </main>
    )
}
