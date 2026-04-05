"use client";

import { useState, useMemo } from "react";
import {
    IndianRupee,
    Calculator,
    Wallet,
    PiggyBank,
    BadgePercent,
    Trophy,
    Scale
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCalculationSave } from "@/hooks/useCalculationSave";

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

export default function TaxBenefitCalculator() {
    const t = useTranslations('tools.taxBenefit');

    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [lifeInsurancePremium, setLifeInsurancePremium] = useState(50000);
    const [healthInsuranceSelf, setHealthInsuranceSelf] = useState(25000);
    const [healthInsuranceParents, setHealthInsuranceParents] = useState(0);
    const [parentsSenior, setParentsSenior] = useState(false);

    const taxResults = useMemo(() => {
        const deductions80C = Math.min(150000, lifeInsurancePremium);
        const limit80D_Self = 25000;
        const limit80D_Parents = parentsSenior ? 50000 : 25000;

        const deductions80D = Math.min(limit80D_Self, healthInsuranceSelf) +
            Math.min(limit80D_Parents, healthInsuranceParents);

        const totalDeductions = deductions80C + deductions80D + 50000;
        const taxableOld = Math.max(0, annualIncome - totalDeductions);

        let taxOld = 0;
        if (taxableOld > 1000000) taxOld = 112500 + (taxableOld - 1000000) * 0.3;
        else if (taxableOld > 500000) taxOld = 12500 + (taxableOld - 500000) * 0.2;
        else if (taxableOld > 250000) taxOld = (taxableOld - 250000) * 0.05;

        const taxableNew = Math.max(0, annualIncome - 50000);

        let taxNew = 0;
        if (annualIncome <= 775000) taxNew = 0;
        else {
            if (taxableNew > 1500000) taxNew = 140000 + (taxableNew - 1500000) * 0.3;
            else if (taxableNew > 1200000) taxNew = 80000 + (taxableNew - 1200000) * 0.2;
            else if (taxableNew > 1000000) taxNew = 50000 + (taxableNew - 1000000) * 0.15;
            else if (taxableNew > 700000) taxNew = 20000 + (taxableNew - 700000) * 0.1;
            else if (taxableNew > 300000) taxNew = (taxableNew - 300000) * 0.05;
        }

        taxOld = Math.round(taxOld * 1.04);
        taxNew = Math.round(taxNew * 1.04);

        return {
            taxOld,
            taxNew,
            savingsOld: Math.max(0, taxNew - taxOld),
            bestRegime: taxNew < taxOld ? "New Regime" : "Old Regime",
            insuranceDeduction: deductions80C + deductions80D
        };
    }, [annualIncome, lifeInsurancePremium, healthInsuranceSelf, healthInsuranceParents, parentsSenior]);

    useCalculationSave('tax-benefit', { annualIncome, lifeInsurancePremium, healthInsuranceSelf, healthInsuranceParents, parentsSenior }, taxResults);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm rounded-full mb-4 font-bold border border-emerald-500/20">
                        <PiggyBank className="w-4 h-4" />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary">
                        {t('title').split(/Tax Check|टैक्स/)[0]}<span className="text-gradient">{t('title').includes('Tax Check') ? 'Tax Check' : 'टैक्स जांच'}</span>
                    </h1>
                    <p className="text-theme-muted mt-4 text-lg max-w-2xl">
                        {t('subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Controls */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="glass-strong rounded-3xl p-8 border border-default shadow-xl space-y-8">

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="annualIncome" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-accent" />
                                        {t('annualIncome')}
                                    </label>
                                    <span className="text-xl font-display font-bold text-theme-primary">
                                        ₹{(annualIncome / 100000).toFixed(1)} Lakh
                                    </span>
                                </div>
                                <input
                                    id="annualIncome"
                                    type="range" min={300000} max={5000000} step={50000}
                                    value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('annualIncome')}
                                />
                            </div>

                            <hr className="border-default opacity-50" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* 80C */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="lifeInsurancePremium" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                            <Calculator className="w-4 h-4 text-accent" />
                                            {t('section80C')}
                                        </label>
                                        <span className="text-accent font-bold">₹{lifeInsurancePremium.toLocaleString()}</span>
                                    </div>
                                    <input
                                        id="lifeInsurancePremium"
                                        type="range" min={0} max={200000} step={5000}
                                        value={lifeInsurancePremium} onChange={(e) => setLifeInsurancePremium(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        title={t('section80C')}
                                    />
                                    <p className="text-[10px] text-theme-muted uppercase font-bold">{t('maxLimit', { amount: '1.5 Lakh' })}</p>
                                </div>

                                {/* 80D Self */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="healthInsuranceSelf" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-accent" />
                                            {t('section80DSelf')}
                                        </label>
                                        <span className="text-accent font-bold">₹{healthInsuranceSelf.toLocaleString()}</span>
                                    </div>
                                    <input
                                        id="healthInsuranceSelf"
                                        type="range" min={0} max={25000} step={1000}
                                        value={healthInsuranceSelf} onChange={(e) => setHealthInsuranceSelf(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        title={t('section80DSelf')}
                                    />
                                </div>
                            </div>

                            {/* 80D Parents */}
                            <div className="space-y-4 p-6 bg-accent/5 rounded-2xl border border-accent/10">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="healthInsuranceParents" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-accent" />
                                        {t('section80DParents')}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-theme-muted">{t('seniorCitizens')}</span>
                                        <button
                                            onClick={() => setParentsSenior(!parentsSenior)}
                                            className={`w-10 h-6 rounded-full p-1 transition-colors ${parentsSenior ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'}`}
                                            aria-label={t('seniorCitizens')}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${parentsSenior ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-display font-bold text-theme-primary">₹{healthInsuranceParents.toLocaleString()}</span>
                                    <span className="text-[10px] text-theme-muted uppercase font-bold">{t('maxLimit', { amount: parentsSenior ? '50k' : '25k' })}</span>
                                </div>
                                <input
                                    id="healthInsuranceParents"
                                    type="range" min={0} max={parentsSenior ? 50000 : 25000} step={1000}
                                    value={healthInsuranceParents} onChange={(e) => setHealthInsuranceParents(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('section80DParents')}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            key={taxResults.taxNew}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-strong rounded-[2.5rem] p-10 border-t-8 border-accent shadow-2xl relative overflow-hidden"
                        >
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="px-4 py-1.5 bg-accent/20 text-accent rounded-full text-xs font-black uppercase tracking-widest">
                                        {t('recommendation')}
                                    </div>
                                </div>
                                <h3 className="text-4xl font-display font-black text-theme-primary">
                                    {t('chooseRegime', { regime: '' })} <span className="text-gradient">{taxResults.bestRegime}</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-default text-left relative overflow-hidden">
                                        <div className={`h-1 w-full absolute top-0 left-0 ${taxResults.bestRegime === 'Old Regime' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-tight mb-1">{t('oldRegimeTax')}</p>
                                        <p className="text-2xl font-black text-theme-primary">₹{taxResults.taxOld.toLocaleString()}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-default text-left relative overflow-hidden">
                                        <div className={`h-1 w-full absolute top-0 left-0 ${taxResults.bestRegime === 'New Regime' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-tight mb-1">{t('newRegimeTax')}</p>
                                        <p className="text-2xl font-black text-theme-primary">₹{taxResults.taxNew.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        {t('annualSaving')}
                                    </p>
                                    <p className="text-3xl font-black text-emerald-600 mt-1">
                                        ₹{Math.abs(taxResults.taxNew - taxResults.taxOld).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Insight */}
                        <div className="glass rounded-3xl p-8 border border-default">
                            <h4 className="font-bold text-theme-primary flex items-center gap-2 mb-4">
                                <Scale className="w-5 h-5 text-accent" />
                                {t('comparison')}
                            </h4>
                            <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                    <p>{t('newRegimeNote', { amount: taxResults.insuranceDeduction.toLocaleString() })}</p>
                                </div>
                                <div className="flex gap-3 text-emerald-600 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <p>{t('oldRegimeSaving', { min: Math.round(taxResults.insuranceDeduction * 0.2).toLocaleString(), max: Math.round(taxResults.insuranceDeduction * 0.3).toLocaleString() })}</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-xl border border-white/10 mt-6 relative overflow-hidden">
                                    <BadgePercent className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5" />
                                    <p className="text-xs text-slate-400">
                                        <strong>Note:</strong> {t('budgetNote')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
