"use client";

import { useState, useMemo } from "react";
import {
    Building2,
    Stethoscope,
    AlertCircle,
    ArrowRight,
    Info,
    ShieldAlert,
    HelpCircle,
    Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCalculationSave } from "@/hooks/useCalculationSave";

function SuggestionItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-accent" />
            </div>
            <div>
                <h5 className="text-sm font-bold text-theme-primary">{title}</h5>
                <p className="text-xs text-theme-secondary mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

export default function RoomRentMapperPage() {
    const t = useTranslations('tools.roomRent');

    const [surgeryCost, setSurgeryCost] = useState(300000);
    const [policyRoomLimit, setPolicyRoomLimit] = useState(5000);
    const [actualRoomRent, setActualRoomRent] = useState(10000);

    const results = useMemo(() => {
        const proportionFactor = Math.min(1, policyRoomLimit / actualRoomRent);
        const payableAmount = surgeryCost * proportionFactor;
        const lossAmount = surgeryCost - payableAmount;

        return {
            payableAmount: Math.round(payableAmount),
            lossAmount: Math.round(lossAmount),
            percentLoss: Math.round((lossAmount / surgeryCost) * 100),
            isCapped: actualRoomRent > policyRoomLimit
        };
    }, [surgeryCost, policyRoomLimit, actualRoomRent]);

    useCalculationSave('room-rent', { surgeryCost, policyRoomLimit, actualRoomRent }, results);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm rounded-full mb-4 font-bold border border-rose-500/20">
                        <ShieldAlert className="w-4 h-4" />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary">
                        {t('title').split(/Room Rent|रूम रेंट/)[0]}<span className="text-rose-500">{t('title').includes('Room Rent') ? 'Room Rent' : 'रूम रेंट'}</span>{t('title').split(/Room Rent|रूम रेंट/).slice(1).join('')}
                    </h1>
                    <p className="text-theme-muted mt-4 text-lg max-w-2xl leading-relaxed">
                        {t('subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Controls Column */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="glass-strong rounded-3xl p-8 border border-default shadow-xl space-y-8">

                            {/* Surgery Cost */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="surgeryCost" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4 text-accent" />
                                        {t('totalBill')}
                                    </label>
                                    <span className="text-xl font-display font-bold text-theme-primary">
                                        ₹{surgeryCost.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <input
                                    id="surgeryCost"
                                    type="range" min={50000} max={2000000} step={25000}
                                    value={surgeryCost} onChange={(e) => setSurgeryCost(Number(e.target.value))}
                                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    title={t('totalBill')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Limit */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="policyRoomLimit" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-accent" />
                                            {t('policyLimit')}
                                        </label>
                                        <span className="text-accent font-bold">₹{policyRoomLimit}{t('perDay')}</span>
                                    </div>
                                    <input
                                        id="policyRoomLimit"
                                        type="range" min={2000} max={20000} step={500}
                                        value={policyRoomLimit} onChange={(e) => setPolicyRoomLimit(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        title={t('policyLimit')}
                                    />
                                    <p className="text-[10px] text-theme-muted">{t('commonHint')}</p>
                                </div>

                                {/* Actual */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="actualRoomRent" className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-rose-500" />
                                            {t('actualRent')}
                                        </label>
                                        <span className="text-rose-500 font-bold">₹{actualRoomRent}{t('perDay')}</span>
                                    </div>
                                    <input
                                        id="actualRoomRent"
                                        type="range" min={2000} max={30000} step={500}
                                        value={actualRoomRent} onChange={(e) => setActualRoomRent(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-rose-500"
                                        title={t('actualRent')}
                                    />
                                </div>
                            </div>

                            {/* Pro-tip */}
                            <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20">
                                <h4 className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-2">
                                    <Info className="w-4 h-4" />
                                    {t('proportionateTitle')}
                                </h4>
                                <p className="text-xs text-theme-secondary leading-relaxed">
                                    {t('proportionateDesc')}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Visualization Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            key={results.lossAmount}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`glass-strong rounded-[2.5rem] p-10 border-t-8 shadow-2xl relative overflow-hidden transition-colors ${results.isCapped ? "border-rose-500" : "border-success-500"
                                }`}
                        >
                            <div className="text-center space-y-6 relative z-10">
                                <h3 className="text-theme-muted text-sm font-bold uppercase tracking-widest">{t('outOfPocket')}</h3>
                                <div className={`text-6xl font-display font-black tabular-nums ${results.isCapped ? "text-rose-500" : "text-success-500"}`}>
                                    ₹{results.lossAmount.toLocaleString('en-IN')}
                                </div>

                                {results.isCapped ? (
                                    <div className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-xs font-bold animate-pulse">
                                        {t('lossDetected', { percent: results.percentLoss })}
                                    </div>
                                ) : (
                                    <div className="bg-success-500/10 text-success-500 px-4 py-2 rounded-xl text-xs font-bold">
                                        {t('safe')}
                                    </div>
                                )}

                                <div className="space-y-4 pt-6">
                                    <div className="flex justify-between items-center text-sm font-medium p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-default">
                                        <span className="text-theme-secondary">{t('insurerPays')}</span>
                                        <span className="font-bold text-theme-primary">₹{results.payableAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                                        <span className="text-rose-500">{t('youPay')}</span>
                                        <span className="font-bold text-rose-500">₹{results.lossAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(results.payableAmount / surgeryCost) * 100}%` }}
                                            className="bg-success-500 h-full"
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(results.lossAmount / surgeryCost) * 100}%` }}
                                            className="bg-rose-500 h-full"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-theme-muted uppercase tracking-tighter">
                                        <span>{t('approvedClaim')}</span>
                                        <span>{t('penalty')}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Suggestions */}
                        <div className="glass rounded-3xl p-8 border border-default space-y-6">
                            <h4 className="font-bold text-theme-primary flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-accent" />
                                {t('avoidLoss')}
                            </h4>

                            <div className="space-y-4">
                                <SuggestionItem
                                    title={t('suggestion1Title')}
                                    desc={t('suggestion1Desc')}
                                />
                                <SuggestionItem
                                    title={t('suggestion2Title')}
                                    desc={t('suggestion2Desc')}
                                />
                            </div>

                            <button className="btn-accent w-full group flex items-center justify-center py-4 text-sm mt-4">
                                {t('compareHealthPlans')}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
