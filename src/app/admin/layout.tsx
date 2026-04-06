import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, Shield, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const session = await auth();

    // ─── Post-Middleware Server Guard ─────────────────────────────────────────
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
        redirect('/auth/signin?error=AccessDenied');
    }

    return (
        <div className="min-h-screen bg-theme-bg flex flex-col">
            {/* Sidebar-lite or Top Nav for Admin */}
            <nav className="fixed top-20 inset-x-0 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-default z-50">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-8 h-full">
                        <Link 
                            href="/admin" 
                            className="flex items-center gap-2 h-full border-b-2 border-accent text-theme-primary px-1 text-sm font-bold"
                        >
                            <LayoutDashboard className="w-4 h-4" /> 
                            Overview
                        </Link>
                        <Link 
                            href="/admin?tab=leads" 
                            className="flex items-center gap-2 h-full border-b-2 border-transparent text-theme-muted hover:text-theme-primary px-1 text-sm font-bold transition-all"
                        >
                            <Users className="w-4 h-4" /> 
                            CRM Hub
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md">
                            <Shield className="w-3 h-3" /> Secure Session
                        </span>
                        <span className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-500/10 rounded-md">
                            <Clock className="w-3 h-3" /> System Health: Operational
                        </span>
                    </div>
                </div>
            </nav>

            {/* Main Admin Content */}
            <div className="flex-1">
                {children}
            </div>

            {/* Admin Footer */}
            <footer className="py-6 border-t border-default bg-theme-surface">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-theme-muted font-medium">
                        InsuranceClarity Node-Central © 2026. All rights Reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-theme-muted">
                        <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> 
                            Vercel Operational
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Telemetry
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
