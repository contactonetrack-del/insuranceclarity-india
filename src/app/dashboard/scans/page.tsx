import Link from 'next/link'
import { ArrowLeft, BadgeCheck, Clock3, FileWarning, Lock, ShieldAlert } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { listUserScans } from '@/services/dashboard.service'
import { requireDashboardUser } from '../_lib/require-dashboard-user'

export const dynamic = 'force-dynamic'

function statusIcon(status: string) {
    if (status === 'COMPLETED') return <BadgeCheck className="h-4 w-4 text-success-500" />
    if (status === 'FAILED') return <FileWarning className="h-4 w-4 text-rose-500" />
    return <Clock3 className="h-4 w-4 text-amber-500" />
}

export default async function DashboardScansPage() {
    const [locale, t] = await Promise.all([
        getLocale(),
        getTranslations('dashboardSubPages.scans'),
    ])

    const { user } = await requireDashboardUser()
    const scans = await listUserScans(user.id)

    function scoreBadge(score: number | null): { label: string; className: string } {
        if (score === null) {
            return { label: t('badges.pendingScore'), className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' }
        }
        if (score >= 70) {
            return { label: t('badges.lowRisk'), className: 'border border-success-500/20 bg-success-50 text-success-500' }
        }
        if (score >= 40) {
            return { label: t('badges.moderateRisk'), className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
        }
        return { label: t('badges.highRisk'), className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' }
    }

    return (
        <main className="min-h-screen px-6 pb-16 pt-28">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-theme-muted">{t('breadcrumb')}</p>
                        <h1 className="mt-1 text-3xl font-display font-bold text-theme-primary">{t('title')}</h1>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2 transition-colors hover:bg-accent/5">
                        <ArrowLeft className="h-4 w-4" />
                        {t('actions.back')}
                    </Link>
                </div>

                {scans.length === 0 ? (
                    <div className="glass-strong rounded-3xl border border-dashed border-default p-10 text-center">
                        <p className="font-semibold text-theme-primary">{t('empty.title')}</p>
                        <p className="mt-1 text-sm text-theme-muted">{t('empty.description')}</p>
                        <Link href="/scan" className="mt-5 inline-flex rounded-xl bg-accent px-5 py-2.5 font-semibold text-white">
                            {t('empty.cta')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scans.map((scan) => {
                            const risks = scan.report?.risks as unknown[] | null | undefined
                            const riskCount = Array.isArray(risks) ? risks.length : 0
                            const badge = scoreBadge(scan.score ?? null)

                            return (
                                <article key={scan.id} className="glass flex flex-col gap-4 rounded-2xl border border-default p-5 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {statusIcon(scan.status)}
                                            <p className="font-semibold text-theme-primary">{scan.fileName}</p>
                                        </div>
                                        <p className="text-xs text-theme-muted">
                                            {new Date(scan.createdAt).toLocaleString(locale)} · {t('labels.status')}: {scan.status}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`rounded-md px-2 py-1 font-semibold ${badge.className}`}>{badge.label}</span>
                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                {t('labels.risks', { count: riskCount })}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                {scan.isPaid ? <ShieldAlert className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                                {scan.isPaid ? t('labels.unlocked') : t('labels.paywalled')}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href={`/scan/result/${scan.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-accent px-4 py-2 font-semibold text-white">
                                        {t('actions.viewReport')}
                                    </Link>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}
