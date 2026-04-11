"use client";

import { useState } from "react";
import {
    FileSearch,
    UploadCloud,
    FileText,
    ShieldAlert,
    Clock,
    CheckCircle,
    AlertTriangle,
    Zap,
    ChevronRight,
    Loader2,
    X
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';

interface ScanResult {
    policyName: string;
    overallScore: number;
    redFlags: { item: string; severity: "High" | "Medium" | "Low"; description: string }[];
    waitingPeriods: { type: string; duration: string; details: string }[];
    underwriterVerdict: string;
}

export default function AIScannerPage() {
    useAuthSession();
    const router = useRouter();
    const t = useTranslations('tools.aiScannerPage');
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function getCsrfToken(): Promise<string | null> {
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
            if (match) return decodeURIComponent(match[1]);
        }
        try {
            const res = await fetch('/api/csrf');
            if (!res.ok) return null;
            const data = await res.json() as { csrfToken?: string };
            return data.csrfToken ?? null;
        } catch {
            return null;
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else {
            setError(t('errors.invalidPdf'));
        }
    }

    async function startScan() {
        if (!file) return;
        setIsScanning(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const csrfToken = await getCsrfToken();
            const resp = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
                },
                body: formData,
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || t('errors.scanFailedFallback'));
            }

            const data = await resp.json() as { scanId?: string; claimToken?: string };
            if (!data.scanId) {
                throw new Error(t('errors.scanFailedFallback'));
            }

            if (data.claimToken && typeof window !== 'undefined') {
                sessionStorage.setItem(`scan_claim_${data.scanId}`, data.claimToken);
            }

            router.push(`/scan/result/${data.scanId}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsScanning(false);
        }
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm rounded-full mb-4 font-bold">
                        <Zap className="w-4 h-4" />
                        {t('hero.badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary">
                        {t('hero.titlePrefix')} <span className="text-gradient">{t('hero.titleHighlight')}</span>
                    </h1>
                    <p className="text-theme-muted mt-4 text-lg max-w-2xl leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12">
                        {!result && !isScanning ? (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="max-w-3xl mx-auto"
                            >
                                <div
                                    className={`glass-strong rounded-[2.5rem] p-12 border-2 border-dashed transition-all cursor-pointer hover:border-accent group relative overflow-hidden ${file ? "border-accent bg-accent/5" : "border-default"}`}
                                    onClick={() => document.getElementById("file-upload")?.click()}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <FileSearch className="w-40 h-40" />
                                    </div>

                                    <div className="text-center space-y-6 relative z-10">
                                        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            {file ? <FileText className="w-10 h-10 text-accent" /> : <UploadCloud className="w-10 h-10 text-accent" />}
                                        </div>
                                        {file ? (
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold text-theme-primary">{file.name}</h3>
                                                <p className="text-theme-muted">{(file.size / 1024 / 1024).toFixed(2)} MB • {t('upload.pdfDocument')}</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                    className="text-rose-500 text-xs font-bold hover:underline flex items-center justify-center gap-1 mx-auto mt-2"
                                                >
                                                    <X className="w-3 h-3" /> {t('actions.removeFile')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold text-theme-primary">{t('upload.dropTitle')}</h3>
                                                <p className="text-theme-muted">{t('upload.dropDescription')}</p>
                                            </div>
                                        )}

                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            aria-label={t('upload.ariaLabel')}
                                            onChange={handleFileUpload}
                                        />

                                        {file && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startScan(); }}
                                                className="btn-accent px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 active:scale-95 transition-all"
                                            >
                                                {t('actions.startAudit')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                                    <FeatureItem icon={<ShieldAlert className="w-4 h-4" />} text={t('features.subLimits')} />
                                    <FeatureItem icon={<Clock className="w-4 h-4" />} text={t('features.waitingPeriods')} />
                                    <FeatureItem icon={<AlertTriangle className="w-4 h-4" />} text={t('features.redFlags')} />
                                </div>
                            </motion.div>
                        ) : isScanning ? (
                            <div className="max-w-md mx-auto text-center py-20 space-y-8">
                                <div className="relative inline-block">
                                    <Loader2 className="w-20 h-20 text-accent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Zap className="w-8 h-8 text-accent animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-theme-primary animate-pulse">{t('scanning.title')}</h3>
                                    <p className="text-theme-muted leading-relaxed">
                                        {t('scanning.description')}
                                    </p>
                                </div>
                                <div className="w-full h-1.5 bg-theme-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "95%" }}
                                        transition={{ duration: 25, ease: "linear" }}
                                        className="h-full bg-accent"
                                    />
                                </div>
                            </div>
                        ) : result && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                            >
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="glass-strong rounded-[2.5rem] p-10 border border-default shadow-xl sticky top-32">
                                        <div className="text-center space-y-6">
                                            <p className="text-theme-muted font-bold text-xs uppercase tracking-widest">{t('result.globalTransparencyScore')}</p>
                                            <div className="relative inline-block">
                                                <svg className="w-40 h-40 transform -rotate-90">
                                                    <circle cx="80" cy="80" r="70" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                                                    <motion.circle
                                                        cx="80" cy="80" r="70"
                                                        className="stroke-accent"
                                                        strokeWidth="12"
                                                        fill="none"
                                                        strokeDasharray={440}
                                                        initial={{ strokeDashoffset: 440 }}
                                                        animate={{ strokeDashoffset: 440 - (440 * result.overallScore) / 100 }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-4xl font-black text-theme-primary">{result.overallScore}</span>
                                                    <span className="text-[10px] font-bold text-theme-muted">{t('result.outOf100')}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-theme-primary">{result.policyName}</h3>
                                                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                                                    <p className="text-sm italic text-theme-secondary leading-relaxed">
                                                        &quot;{result.underwriterVerdict}&quot;
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => { setResult(null); setFile(null); }}
                                                className="text-accent text-sm font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                                            >
                                                {t('actions.scanAnotherPolicy')} <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-8 space-y-12">
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                            <ShieldAlert className="w-6 h-6 text-rose-500" />
                                            {t('result.redFlagsTitle')}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.redFlags.map((flag, idx) => (
                                                <div key={idx} className="glass p-6 rounded-3xl border border-default hover:border-accent/20 transition-all">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${flag.severity === "High" ? "bg-rose-500/10 text-rose-500" :
                                                                flag.severity === "Medium" ? "bg-amber-500/10 text-amber-500" :
                                                                    "bg-info-500/10 text-info-500"
                                                            }`}>
                                                            {t(`severity.${flag.severity.toLowerCase()}`)} {t('severity.suffix')}
                                                        </span>
                                                        <AlertTriangle className={`w-4 h-4 ${flag.severity === "High" ? "text-rose-500" :
                                                                flag.severity === "Medium" ? "text-amber-500" :
                                                                    "text-info-500"
                                                            }`} />
                                                    </div>
                                                    <h4 className="font-bold text-theme-primary mb-2">{flag.item}</h4>
                                                    <p className="text-xs text-theme-muted leading-relaxed">{flag.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                            <Clock className="w-6 h-6 text-accent" />
                                            {t('result.waitingPeriodsTitle')}
                                        </h2>
                                        <div className="space-y-4">
                                            {result.waitingPeriods.map((wp, idx) => (
                                                <div key={idx} className="glass p-5 rounded-2xl border border-default flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center font-bold text-accent">
                                                            {wp.duration}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-theme-primary">{wp.type} {t('result.waitingPeriodSuffix')}</h4>
                                                            <p className="text-xs text-theme-muted">{wp.details}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CheckCircle className="w-5 h-5 text-success-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-default text-xs text-theme-muted leading-relaxed">
                                        <p>
                                            <strong>{t('result.aiDisclosureLabel')}</strong> {t('result.aiDisclosureText')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <div className="max-w-md mx-auto mt-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5" />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-2 text-sm font-medium text-theme-secondary">
            <div className="p-1.5 bg-theme-secondary rounded-lg">
                {icon}
            </div>
            {text}
        </div>
    );
}
