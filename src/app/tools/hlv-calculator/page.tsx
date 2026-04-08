"use client";

import { useState, useMemo } from "react";
import {
    Calculator,
    TrendingUp,
    Home,
    Coins,
    User,
    ShieldCheck,
    Info,
    Save,
    CheckCircle2,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthSession } from '@/lib/auth-client';
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HLVCalculatorPage() {
    const { data: session } = useAuthSession();
    const t = useTranslations('tools.hlv');

    // State for sliders
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [personalExpensesPercent, setPersonalExpensesPercent] = useState(30);
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [existingLiabilities, setExistingLiabilities] = useState(5000000);
    const [inflationRate, setInflationRate] = useState(6);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const hlvResult = useMemo(() => {
        const annualFamilyNeeds = annualIncome * (1 - personalExpensesPercent / 100);
        const yearsToSupport = retirementAge - currentAge;
        const inflationMultiplier = 1 + (inflationRate / 100) * (yearsToSupport / 2);
        const coreHlv = annualFamilyNeeds * yearsToSupport * inflationMultiplier;
        return Math.round(coreHlv + existingLiabilities);
    }, [annualIncome, personalExpensesPercent, currentAge, retirementAge, existingLiabilities, inflationRate]);

    async function handleSave() {
        if (!session) return;
        setIsSaving(true);
        try {
            const resp = await fetch("/api/calculations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "HLV",
                    inputData: {
                        annualIncome,
                        personalExpensesPercent,
                        currentAge,
                        retirementAge,
                        existingLiabilities,
                        inflationRate
                    },
                    result: { hlvResult }
                })
            });

            if (!resp.ok) throw new Error("Failed to save");

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            // Error handled silently — UI feedback via saveSuccess state
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm rounded-full mb-4 font-bold">
                        <Calculator className="w-4 h-4" />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary">
                        {t('title').split(/(?=Are You|आपकी)/)[0]}
                        <span className="text-gradient">{t('title').split(/(?=Are You|आपकी)/).slice(1).join('')}</span>
                    </h1>
                    <p className="text-theme-muted mt-4 text-lg max-w-2xl">
                        {t('subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Controls Column */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="glass-strong rounded-3xl p-8 border border-default shadow-xl space-y-8">

                            {/* Income Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="annualIncome" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-accent" />
                                        {t('annualIncome')}
                                    </label>
                                    <span className="text-xl font-display font-bold text-theme-primary">
                                        ₹{(annualIncome / 100000).toFixed(1)} Lakh
                                    </span>
                                </div>
                                <input
                                    id="annualIncome"
                                    type="range" min={500000} max={20000000} step={100000}
                                    value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('annualIncome')}
                                />
                            </div>

                            {/* Personal Expenses Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="personalExpensesPercent" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <User className="w-4 h-4 text-accent" />
                                        {t('personalExpenses')}
                                    </label>
                                    <span className="text-xl font-display font-bold text-theme-primary">
                                        {personalExpensesPercent}%
                                    </span>
                                </div>
                                <input
                                    id="personalExpensesPercent"
                                    type="range" min={10} max={60} step={5}
                                    value={personalExpensesPercent} onChange={(e) => setPersonalExpensesPercent(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('personalExpenses')}
                                />
                                <p className="text-[10px] text-theme-muted italic">{t('personalExpensesHint')}</p>
                            </div>

                            {/* Age Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="currentAge" className="text-sm font-bold text-theme-primary">{t('currentAge')}</label>
                                        <span className="text-accent font-bold">{currentAge} yr</span>
                                    </div>
                                    <input
                                        id="currentAge"
                                        type="range" min={18} max={60}
                                        value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        title={t('currentAge')}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="retirementAge" className="text-sm font-bold text-theme-primary">{t('retirementAge')}</label>
                                        <span className="text-accent font-bold">{retirementAge} yr</span>
                                    </div>
                                    <input
                                        id="retirementAge"
                                        type="range" min={currentAge + 1} max={75}
                                        value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        title={t('retirementAge')}
                                    />
                                </div>
                            </div>

                            {/* Liabilities */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="existingLiabilities" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <Home className="w-4 h-4 text-accent" />
                                        {t('loans')}
                                    </label>
                                    <span className="text-xl font-display font-bold text-theme-primary">
                                        ₹{(existingLiabilities / 100000).toFixed(1)} Lakh
                                    </span>
                                </div>
                                <input
                                    id="existingLiabilities"
                                    type="range" min={0} max={50000000} step={500000}
                                    value={existingLiabilities} onChange={(e) => setExistingLiabilities(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('loans')}
                                />
                            </div>

                            {/* Inflation */}
                            <div className="space-y-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="inflationRate" className="text-sm font-bold text-accent flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        {t('inflation')}
                                    </label>
                                    <span className="text-lg font-bold text-accent">
                                        {inflationRate}%
                                    </span>
                                </div>
                                <input
                                    id="inflationRate"
                                    type="range" min={4} max={10} step={0.5}
                                    value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))}
                                    className="w-full h-2 touch-none bg-accent/20 rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('inflation')}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            key={hlvResult}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-strong rounded-[2.5rem] p-10 border-t-8 border-accent shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="w-40 h-40" />
                            </div>

                            <div className="relative z-10 text-center space-y-4">
                                <h3 className="text-theme-muted text-sm font-bold uppercase tracking-widest">{t('recommendedCover')}</h3>
                                <div className="text-6xl md:text-7xl font-display font-black text-theme-primary tabular-nums">
                                    ₹{(hlvResult / 10000000).toFixed(2)}<span className="text-accent underline decoration-4 underline-offset-8">Cr</span>
                                </div>
                                <p className="text-theme-muted font-medium">
                                    {t('yearsEstimate', { years: retirementAge - currentAge })}
                                </p>

                                <div className="pt-8 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-default text-left">
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-tight">{t('incomeReplacement')}</p>
                                        <p className="text-sm font-bold text-theme-primary">₹{((hlvResult - existingLiabilities) / 10000000).toFixed(2)} Cr</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-default text-left">
                                        <p className="text-sm font-bold text-theme-primary">₹{(existingLiabilities / 10000000).toFixed(2)} Cr</p>
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-tight">{t('debtCoverage')}</p>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    {session ? (
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${saveSuccess
                                                ? "bg-emerald-500 text-white"
                                                : "bg-theme-primary text-theme-reverse hover:bg-theme-primary/90 shadow-xl"
                                                }`}
                                        >
                                            {isSaving ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                                    <Save className="w-5 h-5" />
                                                </motion.div>
                                            ) : saveSuccess ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {saveSuccess ? t('savedToDashboard') : t('saveCalculation')}
                                        </button>
                                    ) : (
                                        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-left">
                                            <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                                                <Info className="w-4 h-4" />
                                                {t('signInToSave')}
                                            </p>
                                            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                                                {t('signInHint')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Advice Box */}
                        <div className="glass rounded-3xl p-8 border border-default">
                            <h4 className="font-bold text-theme-primary flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                {t('insight')}
                            </h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm leading-relaxed text-theme-secondary">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                                    <span>{t('insightRule')}</span>
                                </li>
                                <li className="flex gap-3 text-sm leading-relaxed text-theme-secondary">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                                    <span>{t('insightRevisit')}</span>
                                </li>
                            </ul>
                            <Link
                                href="/personal/life-insurance"
                                className="btn-accent w-full mt-8 group flex items-center justify-center py-4 text-sm"
                            >
                                {t('compareTermLife')}
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
