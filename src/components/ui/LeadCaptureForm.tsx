'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Shield, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

type LeadFormData = {
    name: string
    email: string
    phone: string
    insuranceType: string
}

interface Props {
    title?: string
    subtitle?: string
    defaultInsuranceType?: string
}

export default function LeadCaptureForm({
    title,
    subtitle,
    defaultInsuranceType,
}: Props) {
    const t = useTranslations('leadCaptureForm')
    const resolvedTitle = title ?? t('titleDefault')
    const resolvedSubtitle = subtitle ?? t('subtitleDefault')
    const resolvedDefaultInsuranceType = defaultInsuranceType ?? t('defaultInsuranceType')

    const leadSchema = z.object({
        name: z.string().min(2, t('validation.nameTooShort')),
        email: z.string().email(t('validation.invalidEmail')),
        phone: z.string().regex(/^[0-9]{10,12}$/, t('validation.invalidPhone')),
        insuranceType: z.string().min(2, t('validation.insuranceTypeRequired')),
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [serverError, setServerError] = useState('')

    const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            insuranceType: resolvedDefaultInsuranceType,
        },
    })

    const onSubmit = async (data: LeadFormData) => {
        setIsSubmitting(true)
        setServerError('')

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    sourceUrl: typeof window !== 'undefined' ? window.location.href : 'Unknown'
                })
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.message || t('errors.requestFailed'))
            }

            setIsSuccess(true)
        } catch (error: unknown) {
            if (error instanceof Error) {
                setServerError(error.message || t('errors.submitFailed'))
            } else {
                setServerError(t('errors.unexpected'))
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-8 md:p-10 text-center relative overflow-hidden shadow-xl"
            >
                <div className="absolute inset-0 bg-gradient-accent opacity-5 pointer-events-none" />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-success-50 text-success-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-theme-primary mb-3">{t('success.title')}</h3>
                <p className="text-theme-secondary">
                    {t('success.description', { insuranceType: resolvedDefaultInsuranceType })}
                </p>
            </motion.div>
        )
    }

    return (
        <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-default group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:bg-accent/10" />

            <div className="relative z-10 lg:flex lg:gap-12 items-center">
                <div className="lg:w-1/2 mb-8 lg:mb-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold tracking-wider mb-6">
                        <Shield className="w-3.5 h-3.5" />
                        {t('badge')}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-display font-bold text-theme-primary mb-4 leading-tight">
                        {resolvedTitle}
                    </h2>
                    <p className="text-theme-secondary text-lg mb-6 leading-relaxed">
                        {resolvedSubtitle}
                    </p>

                    <ul className="space-y-3">
                        {[
                            t('benefits.compareTopInsurers'),
                            t('benefits.unbiasedAdvice'),
                            t('benefits.freeClaimAssistance'),
                        ].map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-theme-primary">
                                <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3 h-3" />
                                </span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:w-1/2">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-theme-base/50 p-6 rounded-2xl border border-default shadow-sm backdrop-blur-sm">

                        <div>
                            <label className="block text-xs font-bold text-theme-primary mb-1.5 uppercase tracking-wider">{t('fields.name.label')}</label>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder={t('fields.name.placeholder')}
                                className="w-full px-4 py-3 bg-theme-surface border border-default rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-theme-primary"
                                disabled={isSubmitting}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-theme-primary mb-1.5 uppercase tracking-wider">{t('fields.phone.label')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted font-medium">+91</span>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        placeholder={t('fields.phone.placeholder')}
                                        className="w-full pl-12 pr-4 py-3 bg-theme-surface border border-default rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-theme-primary"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-theme-primary mb-1.5 uppercase tracking-wider">{t('fields.email.label')}</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder={t('fields.email.placeholder')}
                                    className="w-full px-4 py-3 bg-theme-surface border border-default rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-theme-primary"
                                    disabled={isSubmitting}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                            </div>
                        </div>

                        <input type="hidden" {...register('insuranceType')} />

                        {serverError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium text-center">
                                {serverError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full group relative flex items-center justify-center gap-2 py-4 px-6 bg-gradient-accent text-white font-bold rounded-xl shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 transition-all overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative z-10 flex items-center gap-2">
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('actions.processing')}</>
                                ) : (
                                    <>{t('actions.submit')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </span>
                        </button>

                        <p className="text-[10px] text-theme-muted text-center max-w-xs mx-auto mt-4">
                            {t('consent')}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
