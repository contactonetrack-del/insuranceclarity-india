"use client";

import { useState, useMemo } from "react";
import {
    IndianRupee,
    Calculator,
    Wallet,
    PiggyBank,
    ArrowRight,
    Info,
    BadgePercent,
    ChevronDown,
    Trophy,
    Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TaxBenefitCalculator() {
    // Inputs
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [lifeInsurancePremium, setLifeInsurancePremium] = useState(50000); // 80C
    const [healthInsuranceSelf, setHealthInsuranceSelf] = useState(25000); // 80D
    const [healthInsuranceParents, setHealthInsuranceParents] = useState(0); // 80D
    const [parentsSenior, setParentsSenior] = useState(false);

    const taxResults = useMemo(() => {
        // OLD REGIME CALCULATION
        const deductions80C = Math.min(150000, lifeInsurancePremium);
        const limit80D_Self = 25000;
        const limit80D_Parents = parentsSenior ? 50000 : 25000;

        const deductions80D = Math.min(limit80D_Self, healthInsuranceSelf) +
            Math.min(limit80D_Parents, healthInsuranceParents);

        const totalDeductions = deductions80C + deductions80D + 50000; // + Standard Deduction
        const taxableOld = Math.max(0, annualIncome - totalDeductions);

        // Simple Old Regime Slab (Conservative approx)
        let taxOld = 0;
        if (taxableOld > 1000000) taxOld = 112500 + (taxableOld - 1000000) * 0.3;
        else if (taxableOld > 500000) taxOld = 12500 + (taxableOld - 500000) * 0.2;
        else if (taxableOld > 250000) taxOld = (taxableOld - 250000) * 0.05;

        // NEW REGIME (FY 2024-25 / Budget 2024)
        // No deductions allowed in New Regime except Standard Deduction
        const taxableNew = Math.max(0, annualIncome - 50000); // Standard deduction only

        let taxNew = 0;
        // New Slab: 0-3L (0), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), >15L (30%)
        // Rebate up to 7L (effectively 0 tax if income <= 7.75L with std deduction)
        if (annualIncome <= 775000) taxNew = 0;
        else {
            if (taxableNew > 1500000) taxNew = 140000 + (taxableNew - 1500000) * 0.3;
            else if (taxableNew > 1200000) taxNew = 80000 + (taxableNew - 1200000) * 0.2;
            else if (taxableNew > 1000000) taxNew = 50000 + (taxableNew - 1000000) * 0.15;
            else if (taxableNew > 700000) taxNew = 20000 + (taxableNew - 700000) * 0.1;
            else if (taxableNew > 300000) taxNew = (taxableNew - 300000) * 0.05;
        }

        // Add Cess (4%)
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

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm rounded-full mb-4 font-bold border border-emerald-500/20">
                        <PiggyBank className="w-4 h-4" />
                        TAX OPTIMIZER FY 2024-25
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary">
                        Old vs New <span className="text-gradient">Tax Check</span>
                    </h1>
                    <p className="text-theme-muted mt-4 text-lg max-w-2xl">
                        See how your insurance premiums affect your tax liability under Section 80C and 80D. Find your perfect regime.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Controls */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="glass-strong rounded-3xl p-8 border border-default shadow-xl space-y-8">

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-accent" />
                                        Annual Gross Income (₹)
                                    </label>
                                    <span className="text-xl font-display font-bold text-theme-primary">
                                        ₹{(annualIncome / 100000).toFixed(1)} Lakh
                                    </span>
                                </div>
                                <input
                                    type="range" min={300000} max={5000000} step={50000}
                                    value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>

                            <hr className="border-default opacity-50" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* 80C */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                            <Calculator className="w-4 h-4 text-accent" />
                                            Section 80C (Life Ins)
                                        </label>
                                        <span className="text-accent font-bold">₹{lifeInsurancePremium.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range" min={0} max={200000} step={5000}
                                        value={lifeInsurancePremium} onChange={(e) => setLifeInsurancePremium(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                    <p className="text-[10px] text-theme-muted uppercase font-bold">Max Limit: ₹1.5 Lakh</p>
                                </div>

                                {/* 80D Self */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-accent" />
                                            80D (Health - Self)
                                        </label>
                                        <span className="text-accent font-bold">₹{healthInsuranceSelf.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range" min={0} max={25000} step={1000}
                                        value={healthInsuranceSelf} onChange={(e) => setHealthInsuranceSelf(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                </div>
                            </div>

                            {/* 80D Parents */}
                            <div className="space-y-4 p-6 bg-accent/5 rounded-2xl border border-accent/10">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <User className="w-4 h-4 text-accent" />
                                        80D (Health - Parents)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-theme-muted">Senior Citizens?</span>
                                        <button
                                            onClick={() => setParentsSenior(!parentsSenior)}
                                            className={`w-10 h-6 rounded-full p-1 transition-colors ${parentsSenior ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${parentsSenior ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-display font-bold text-theme-primary">₹{healthInsuranceParents.toLocaleString()}</span>
                                    <span className="text-[10px] text-theme-muted uppercase font-bold">Max Limit: ₹{parentsSenior ? '50' : '25'}k</span>
                                </div>
                                <input
                                    type="range" min={0} max={parentsSenior ? 50000 : 25000} step={1000}
                                    value={healthInsuranceParents} onChange={(e) => setHealthInsuranceParents(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
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
                                        Our Recommendation
                                    </div>
                                </div>
                                <h3 className="text-4xl font-display font-black text-theme-primary">
                                    Choose <span className="text-gradient">{taxResults.bestRegime}</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-default text-left relative overflow-hidden">
                                        <div className={`h-1 w-full absolute top-0 left-0 ${taxResults.bestRegime === 'Old Regime' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-tight mb-1">Old Regime Tax</p>
                                        <p className="text-2xl font-black text-theme-primary">₹{taxResults.taxOld.toLocaleString()}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-default text-left relative overflow-hidden">
                                        <div className={`h-1 w-full absolute top-0 left-0 ${taxResults.bestRegime === 'New Regime' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-tight mb-1">New Regime Tax</p>
                                        <p className="text-2xl font-black text-theme-primary">₹{taxResults.taxNew.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        Potential Annual Saving
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
                                Regime Comparison Points
                            </h4>
                            <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                    <p>In <strong>New Regime</strong>, your insurance premiums (₹{taxResults.insuranceDeduction.toLocaleString()}) have <strong>zero impact</strong> on tax.</p>
                                </div>
                                <div className="flex gap-3 text-emerald-600 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <p>In <strong>Old Regime</strong>, you are currently saving ₹{Math.round(taxResults.insuranceDeduction * 0.2)} to ₹{Math.round(taxResults.insuranceDeduction * 0.3)} in taxes just through insurance.</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-xl border border-white/10 mt-6 relative overflow-hidden">
                                    <BadgePercent className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5" />
                                    <p className="text-xs text-slate-400">
                                        <strong>Note:</strong> Budget 2024 increased New Regime slabs. If your income is above 15L and you have less than 4.5L in total deductions, New Regime is usually better.
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

function User({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}
