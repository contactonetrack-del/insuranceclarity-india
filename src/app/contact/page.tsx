'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Clock, ExternalLink, Shield, Send, Loader2, CheckCircle } from 'lucide-react'

const contactChannels = [
    {
        icon: Mail,
        title: 'Email Us',
        value: 'contact@insuranceclarity.in',
        href: 'mailto:contact@insuranceclarity.in',
        description: 'For general queries and feedback. We reply within 24 hours.',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        icon: MapPin,
        title: 'Location',
        value: 'India',
        description: 'Serving insurance buyers across all states and union territories.',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        icon: Clock,
        title: 'Response Time',
        value: 'Within 24 hours',
        description: 'Monday to Saturday, 9 AM – 6 PM IST. Sundays we may be slower.',
        color: 'from-amber-500 to-orange-600',
    },
]

const officialLinks = [
    {
        label: 'IRDAI Grievance Portal (IGMS)',
        href: 'https://igms.irda.gov.in',
        description: 'File complaints against insurance companies',
    },
    {
        label: 'Insurance Ombudsman',
        href: 'https://www.cioins.co.in/Ombudsman',
        description: 'Free dispute resolution for policyholders',
    },
]

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus('loading')
        setErrorMsg('')

        const fd = new FormData(e.currentTarget)
        const data = {
            name: fd.get('name'),
            email: fd.get('email'),
            message: fd.get('message')
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Something went wrong')
            }
            setStatus('success')
        } catch (error: any) {
            setStatus('error')
            setErrorMsg(error.message)
        }
    }

    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full 
                                     text-accent text-sm font-medium mb-6">
                        <Mail className="w-4 h-4" />
                        We&apos;d love to hear from you
                    </span>
                    <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-4">
                        Contact <span className="text-gradient">Us</span>
                    </h1>
                    <p className="text-theme-secondary text-lg leading-relaxed">
                        Have a question, found an error, or want to collaborate?
                        We&apos;re a small independent team and we personally read every message.
                    </p>
                </div>
            </section>

            {/* Form + Channels Layout */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 mb-16">

                    {/* Contact Form */}
                    <div className="flex-1 glass p-8 rounded-3xl border border-default shadow-xl">
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-6">Send a Message</h2>
                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold text-theme-primary">Message Sent!</h3>
                                <p className="text-theme-secondary mt-2 max-w-sm">
                                    Thanks for reaching out. We've received your message and will get back to you shortly.
                                </p>
                                <button onClick={() => setStatus('idle')} className="mt-8 text-accent font-medium hover:underline">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-theme-primary ml-1">Full Name</label>
                                        <input required minLength={2} type="text" id="name" name="name"
                                            className="w-full bg-theme-bg/50 border border-default rounded-xl px-4 py-3 text-theme-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-theme-muted"
                                            placeholder="Rahul Sharma" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-theme-primary ml-1">Email Address</label>
                                        <input required type="email" id="email" name="email"
                                            className="w-full bg-theme-bg/50 border border-default rounded-xl px-4 py-3 text-theme-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-theme-muted"
                                            placeholder="rahul@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-theme-primary ml-1">Message</label>
                                    <textarea required minLength={10} id="message" name="message" rows={5}
                                        className="w-full bg-theme-bg/50 border border-default rounded-xl px-4 py-3 text-theme-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-theme-muted resize-none"
                                        placeholder="How can we help you today?" />
                                </div>

                                {status === 'error' && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                                        {errorMsg}
                                    </div>
                                )}

                                <button type="submit" disabled={status === 'loading'}
                                    className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-70">
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info Sidebar */}
                    <div className="lg:w-[380px] space-y-6">
                        {contactChannels.map((channel) => (
                            <div key={channel.title} className="glass rounded-2xl p-6 border border-default flex items-start gap-4">
                                <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center`}>
                                    <channel.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-base text-theme-primary mb-1">
                                        {channel.title}
                                    </h2>
                                    {channel.href ? (
                                        <a href={channel.href} className="text-accent font-medium text-sm hover:underline">
                                            {channel.value}
                                        </a>
                                    ) : (
                                        <p className="text-theme-primary font-medium text-sm">{channel.value}</p>
                                    )}
                                    <p className="text-theme-muted text-xs mt-1 leading-relaxed">
                                        {channel.description}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5 mt-8">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h2 className="font-bold text-sm text-theme-primary mb-1">Important</h2>
                                    <p className="text-theme-secondary text-xs leading-relaxed">
                                        We are an educational platform, not an IRDAI-licensed agent.
                                        We do not sell insurance directly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regulatory Links */}
                <div className="max-w-4xl mx-auto pt-8 border-t border-default">
                    <h2 className="font-display font-bold text-xl text-theme-primary mb-6 text-center">
                        Official Regulatory Portals
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {officialLinks.map((link) => (
                            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 glass rounded-xl border border-default hover:border-hover transition-all group">
                                <div>
                                    <p className="font-semibold text-sm text-theme-primary group-hover:text-accent transition-colors">
                                        {link.label}
                                    </p>
                                    <p className="text-xs text-theme-muted mt-0.5">{link.description}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-theme-muted group-hover:text-accent" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

