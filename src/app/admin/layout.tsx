import { Clock, FileText, LayoutDashboard, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const t = await getTranslations('adminDashboard.layout')
    const session = await auth()

    // Post-middleware server guard
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
        redirect('/auth/signin?error=AccessDenied')
    }

    return (
        <div className="flex min-h-screen flex-col bg-theme-bg">
            <nav className="fixed inset-x-0 top-20 z-50 h-14 border-b border-default bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
                <div className="container mx-auto flex h-full items-center justify-between px-4">
                    <div className="flex h-full items-center gap-8">
                        <Link href="/admin" className="flex h-full items-center gap-2 border-b-2 border-accent px-1 text-sm font-bold text-theme-primary">
                            <LayoutDashboard className="h-4 w-4" />
                            {t('nav.overview')}
                        </Link>
                        <Link href="/admin?tab=leads" className="flex h-full items-center gap-2 border-b-2 border-transparent px-1 text-sm font-bold text-theme-muted transition-all hover:text-theme-primary">
                            <Users className="h-4 w-4" />
                            {t('nav.crmHub')}
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-theme-muted">
                        <span className="flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-accent">
                            <Shield className="h-3 w-3" />
                            {t('badges.secureSession')}
                        </span>
                        <span className="hidden items-center gap-1.5 rounded-md bg-slate-500/10 px-2 py-1 md:flex">
                            <Clock className="h-3 w-3" />
                            {t('badges.systemHealthOperational')}
                        </span>
                    </div>
                </div>
            </nav>

            <div className="flex-1">{children}</div>

            <footer className="border-t border-default bg-theme-surface py-6">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
                    <p className="text-xs font-medium text-theme-muted">
                        {t('footer.copyright')}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-theme-muted">
                        <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {t('footer.vercelOperational')}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                            {t('footer.liveTelemetry')}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
