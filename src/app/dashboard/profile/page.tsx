import Link from 'next/link';
import { ArrowLeft, BadgeCheck, CalendarClock, Shield } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { getLimitsForPlan } from '@/lib/subscriptions/plan-limits';
import { getReferralCodeForUser, getReferralStats } from '@/lib/referrals';
import { getUserDashboardCounts } from '@/services/dashboard.service';
import { requireDashboardUser } from '../_lib/require-dashboard-user';

export const dynamic = 'force-dynamic';

export default async function DashboardProfilePage() {
    const [locale, t] = await Promise.all([
        getLocale(),
        getTranslations('dashboardSubPages.profile'),
    ]);

    const { user } = await requireDashboardUser();

    const { scanCount, quoteCount, calcCount } = await getUserDashboardCounts(user.id);
    const referralCode = getReferralCodeForUser(user.id);
    const referralStats = await getReferralStats(referralCode);

    const limits = getLimitsForPlan(user.plan);
    const monthlyLimit = limits.maxScansPerMonth === Infinity ? t('labels.unlimited') : limits.maxScansPerMonth.toString();
    const usedScans = limits.maxScansPerMonth === Infinity ? t('labels.unlimited') : user.scansUsed.toString();

    return (
        <main className="min-h-screen pt-28 pb-16 px-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-theme-muted">{t('breadcrumb')}</p>
                        <h1 className="text-3xl font-display font-bold text-theme-primary mt-1">{t('title')}</h1>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-default hover:bg-accent/5 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t('actions.back')}
                    </Link>
                </div>

                <section className="glass rounded-3xl border border-default p-6 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-theme-muted">{t('account.label')}</p>
                            <h2 className="text-2xl font-semibold text-theme-primary mt-1">{user.name ?? t('account.fallbackName')}</h2>
                            <p className="text-theme-secondary mt-1">{user.email}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
                            <Shield className="w-4 h-4" />
                            {user.plan}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-default p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('usage.monthlyScanUsage')}</p>
                            <p className="text-xl font-semibold text-theme-primary mt-2">{usedScans} / {monthlyLimit}</p>
                        </div>
                        <div className="rounded-2xl border border-default p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('usage.accountRole')}</p>
                            <p className="text-xl font-semibold text-theme-primary mt-2 inline-flex items-center gap-2">
                                <BadgeCheck className="w-5 h-5 text-accent" />
                                {user.role}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-default p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('usage.memberSince')}</p>
                            <p className="text-xl font-semibold text-theme-primary mt-2 inline-flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-accent" />
                                {new Date(user.createdAt).toLocaleDateString(locale)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-default p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('usage.planExpiry')}</p>
                            <p className="text-xl font-semibold text-theme-primary mt-2">
                                {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString(locale) : t('usage.notSet')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass rounded-2xl border border-default p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('stats.totalScans')}</p>
                        <p className="text-2xl font-semibold text-theme-primary mt-2">{scanCount}</p>
                    </div>
                    <div className="glass rounded-2xl border border-default p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('stats.savedQuotes')}</p>
                        <p className="text-2xl font-semibold text-theme-primary mt-2">{quoteCount}</p>
                    </div>
                    <div className="glass rounded-2xl border border-default p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('stats.calculations')}</p>
                        <p className="text-2xl font-semibold text-theme-primary mt-2">{calcCount}</p>
                    </div>
                </section>

                <section className="glass rounded-2xl border border-default p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">{t('referral.program')}</p>
                            <p className="text-xl font-semibold text-theme-primary mt-1">{referralCode}</p>
                            <p className="text-sm text-theme-secondary mt-1">
                                {t('referral.shareLinkPrefix')} <span className="font-medium">/refer?code={referralCode}</span>
                            </p>
                        </div>
                        <div className="text-sm text-theme-secondary space-y-1 text-right">
                            <p>{t('referral.visits')}: <span className="font-semibold text-theme-primary">{referralStats.visits}</span></p>
                            <p>{t('referral.conversions')}: <span className="font-semibold text-theme-primary">{referralStats.conversions}</span></p>
                        </div>
                    </div>
                </section>

                <div className="flex flex-wrap gap-3">
                    <Link href="/pricing" className="inline-flex px-5 py-2.5 rounded-xl bg-accent text-white font-semibold">
                        {t('actions.managePlan')}
                    </Link>
                    <Link href="/contact" className="inline-flex px-5 py-2.5 rounded-xl border border-default font-semibold text-theme-primary hover:bg-accent/5">
                        {t('actions.contactSupport')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
