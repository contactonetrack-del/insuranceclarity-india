'use client'

import { useState } from 'react'
import { Mail, MapPin, Clock, ExternalLink, Shield, Send, Loader2, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { resolveToneSurfaceClass, type Tone } from '@/lib/theme/tone'

export default function ContactPage() {
    const t = useTranslations('contactPage')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const contactChannels = [
        {
            id: 'email',
            icon: Mail,
            title: t('channels.email.title'),
            value: 'contact@insuranceclarity.in',
            href: 'mailto:contact@insuranceclarity.in',
            description: t('channels.email.description'),
            tone: 'brand' as Tone,
            surface: 'gradient' as const,
        },
        {
            id: 'location',
            icon: MapPin,
            title: t('channels.location.title'),
            value: t('channels.location.value'),
            description: t('channels.location.description'),
            tone: 'success' as Tone,
            surface: 'gradient' as const,
        },
        {
            id: 'responseTime',
            icon: Clock,
            title: t('channels.responseTime.title'),
            value: t('channels.responseTime.value'),
            description: t('channels.responseTime.description'),
            tone: 'warning' as Tone,
            surface: 'gradient' as const,
        },
    ]

    const officialLinks = [
        {
            id: 'irdai',
            label: t('officialLinks.irdai.label'),
            href: 'https://igms.irda.gov.in',
            description: t('officialLinks.irdai.description'),
        },
        {
            id: 'ombudsman',
            label: t('officialLinks.ombudsman.label'),
            href: 'https://www.cioins.co.in/Ombudsman',
            description: t('officialLinks.ombudsman.description'),
        },
    ]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus('loading')
        setErrorMsg('')

        const fd = new FormData(e.currentTarget)
        const data = {
            name: fd.get('name'),
            email: fd.get('email'),
            message: fd.get('message'),
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || t('form.errors.fallback'))
            }

            setStatus('success')
        } catch (error) {
            setStatus('error')
            setErrorMsg(error instanceof Error ? error.message : t('form.errors.fallback'))
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <section className="px-6 py-16 text-center">
                <div className="mx-auto max-w-2xl">
                    <span
                        className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 
                                     text-sm font-medium text-accent"
                    >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        {t('hero.badge')}
                    </span>
                    <h1 className="font-display mb-4 text-4xl font-bold text-theme-primary md:text-5xl">
                        {t('hero.titlePrefix')} <span className="text-gradient">{t('hero.titleHighlight')}</span>
                    </h1>
                    <p className="text-lg leading-relaxed text-theme-secondary">
                        {t('hero.description')}
                    </p>
                </div>
            </section>

            <section className="px-6 py-12">
                <div className="mx-auto mb-16 flex max-w-6xl flex-col gap-12 lg:flex-row">
                    <div className="glass flex-1 rounded-3xl border border-default p-8 shadow-xl">
                        <h2 className="font-display mb-6 text-2xl font-bold text-theme-primary">{t('form.title')}</h2>
                        {status === 'success' ? (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                                    <CheckCircle className="h-8 w-8 text-accent" aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-bold text-theme-primary">{t('form.success.title')}</h3>
                                <p className="mt-2 max-w-sm text-theme-secondary">
                                    {t('form.success.description')}
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-8 font-medium text-accent hover:underline"
                                >
                                    {t('form.success.reset')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="ml-1 text-sm font-medium text-theme-primary">
                                            {t('form.fields.name.label')}
                                        </label>
                                        <input
                                            required
                                            minLength={2}
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full rounded-xl border border-default bg-theme-bg/50 px-4 py-3 text-theme-primary outline-none transition-all placeholder:text-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                                            placeholder={t('form.fields.name.placeholder')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="ml-1 text-sm font-medium text-theme-primary">
                                            {t('form.fields.email.label')}
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="w-full rounded-xl border border-default bg-theme-bg/50 px-4 py-3 text-theme-primary outline-none transition-all placeholder:text-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                                            placeholder={t('form.fields.email.placeholder')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="ml-1 text-sm font-medium text-theme-primary">
                                        {t('form.fields.message.label')}
                                    </label>
                                    <textarea
                                        required
                                        minLength={10}
                                        id="message"
                                        name="message"
                                        rows={5}
                                        className="w-full resize-none rounded-xl border border-default bg-theme-bg/50 px-4 py-3 text-theme-primary outline-none transition-all placeholder:text-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                                        placeholder={t('form.fields.message.placeholder')}
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-70"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {t('form.actions.sending')}
                                        </>
                                    ) : (
                                        <>
                                            {t('form.actions.send')}
                                            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="space-y-6 lg:w-[380px]">
                        {contactChannels.map((channel) => (
                            <div key={channel.id} className="glass flex items-start gap-4 rounded-2xl border border-default p-6">
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${resolveToneSurfaceClass(channel.tone, channel.surface)}`}
                                >
                                    <channel.icon className="h-5 w-5 text-white" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2 className="font-display mb-1 text-base font-bold text-theme-primary">
                                        {channel.title}
                                    </h2>
                                    {channel.href ? (
                                        <a href={channel.href} className="text-sm font-medium text-accent hover:underline">
                                            {channel.value}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-medium text-theme-primary">{channel.value}</p>
                                    )}
                                    <p className="mt-1 text-xs leading-relaxed text-theme-muted">
                                        {channel.description}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className={`glass mt-8 rounded-2xl border p-6 ${resolveToneSurfaceClass('warning', 'soft')}`}>
                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" aria-hidden="true" />
                                <div>
                                    <h2 className="mb-1 text-sm font-bold text-theme-primary">{t('important.title')}</h2>
                                    <p className="text-xs leading-relaxed text-theme-secondary">
                                        {t('important.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl border-t border-default pt-8">
                    <h2 className="font-display mb-6 text-center text-xl font-bold text-theme-primary">
                        {t('officialLinks.title')}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {officialLinks.map((link) => (
                            <a
                                key={link.id}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between rounded-xl border border-default p-4 transition-all hover:border-hover glass"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-theme-primary transition-colors group-hover:text-accent">
                                        {link.label}
                                    </p>
                                    <p className="mt-0.5 text-xs text-theme-muted">{link.description}</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-theme-muted group-hover:text-accent" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
