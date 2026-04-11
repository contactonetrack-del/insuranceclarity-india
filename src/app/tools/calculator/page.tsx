'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { trackCalculatorUsed } from '@/services/analytics.service'
import Link from 'next/link'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import {
    Calculator,
    ArrowRight,
    CheckCircle,
    Info,
    MapPin,
    Briefcase,
    Stethoscope,
    Zap,
    Activity,
    Users,
    ChevronDown,
    AlertTriangle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCalculationSave } from '@/hooks/useCalculationSave'

type InsuranceType = 'life' | 'health' | 'vehicle'
type Gender = 'male' | 'female' | 'other'

const BASE_RATES: Record<InsuranceType, number> = {
    life: 2000,
    health: 5000,
    vehicle: 3000,
}

const GST_RATES: Record<InsuranceType, number> = {
    life: 0,
    health: 0,
    vehicle: 0.18,
}

const INSURANCE_TYPES: InsuranceType[] = ['life', 'health', 'vehicle']
const GENDERS: Gender[] = ['male', 'female', 'other']

const OCCUPATIONS = [
    { labelKey: 'occupations.salaried', value: 'salaried', risk: 1.0 },
    { labelKey: 'occupations.professional', value: 'professional', risk: 1.1 },
    { labelKey: 'occupations.highRisk', value: 'high_risk', risk: 1.35 },
    { labelKey: 'occupations.others', value: 'others', risk: 1.05 },
] as const

const LOCATIONS = [
    { labelKey: 'locations.tier1', value: 'tier1', factor: 1.15 },
    { labelKey: 'locations.tier2', value: 'tier2', factor: 1.05 },
    { labelKey: 'locations.tier3', value: 'tier3', factor: 1.0 },
] as const

const RIDERS = [
    { id: 'ci', labelKey: 'riders.ci', base: 1200, factor: 0.02 },
    { id: 'adb', labelKey: 'riders.adb', base: 500, factor: 0.01 },
    { id: 'wop', labelKey: 'riders.wop', base: 300, factor: 0.005 },
] as const

const SUM_ASSURED_OPTIONS = [1000000, 2500000, 5000000, 10000000] as const

export default function CalculatorPage() {
    const t = useTranslations('tools.calculator')
    const regulatoryT = useTranslations('regulatoryDisclaimer')

    const [age, setAge] = useState<number>(28)
    const [type, setType] = useState<InsuranceType>('life')
    const [sumAssured, setSumAssured] = useState<number>(5000000)
    const [gender, setGender] = useState<Gender>('male')

    const [isSmoker, setIsSmoker] = useState(false)
    const [occupation, setOccupation] = useState('salaried')
    const [location, setLocation] = useState('tier2')
    const [selectedRiders, setSelectedRiders] = useState<string[]>([])
    const [policyTerm, setPolicyTerm] = useState<number>(20)

    const [premium, setPremium] = useState<number>(0)
    const [gstAmount, setGstAmount] = useState<number>(0)
    const [breakdown, setBreakdown] = useState({ base: 0, risk: 0, riders: 0 })
    const [isCalculating, setIsCalculating] = useState(false)
    const [confidence, setConfidence] = useState(85)
    const [regulatoryOpen, setRegulatoryOpen] = useState(false)

    const performCalculation = useMemo(() => {
        const baseRate = BASE_RATES[type]

        const ageFactor = 1 + ((age - 18) * 0.035)
        const genderFactor = gender === 'female' ? 0.92 : 1.0
        const termFactor = policyTerm <= 10 ? 1.12 : policyTerm <= 20 ? 1.0 : policyTerm <= 30 ? 0.94 : 0.90
        const profileBase = baseRate * ageFactor * genderFactor * termFactor

        const smokerFactor = isSmoker ? 1.45 : 1.0
        const occRisk = OCCUPATIONS.find((o) => o.value === occupation)?.risk ?? 1.0
        const locFactor = LOCATIONS.find((l) => l.value === location)?.factor ?? 1.0
        const riskApplied = profileBase * smokerFactor * occRisk * locFactor

        const sumFactor = (sumAssured / 100000) * 1.8
        const totalBase = riskApplied + sumFactor

        let riderTotal = 0
        selectedRiders.forEach((ridId) => {
            const rider = RIDERS.find((r) => r.id === ridId)
            if (!rider) return
            riderTotal += rider.base + (sumAssured * (rider.factor / 100))
        })

        const totalBeforeGST = totalBase + riderTotal
        const gstRate = GST_RATES[type] ?? 0
        const gst = Math.round(totalBeforeGST * gstRate)
        const total = Math.round(totalBeforeGST) + gst

        return {
            total,
            gst,
            gstRate,
            breakdown: {
                base: Math.round(profileBase + sumFactor),
                risk: Math.round(totalBase - (profileBase + sumFactor)),
                riders: Math.round(riderTotal),
            },
        }
    }, [age, gender, isSmoker, location, occupation, policyTerm, selectedRiders, sumAssured, type])

    useEffect(() => {
        setIsCalculating(true)
        const timer = setTimeout(() => {
            setPremium(performCalculation.total)
            setGstAmount(performCalculation.gst)
            setBreakdown(performCalculation.breakdown)
            setIsCalculating(false)

            let calculatedConfidence = 85
            if (age > 60) calculatedConfidence -= 10
            if (isSmoker) calculatedConfidence += 3
            if (policyTerm >= 20) calculatedConfidence += 5
            setConfidence(Math.min(97, calculatedConfidence))

            trackCalculatorUsed({
                type: type === 'vehicle' ? 'motor' : type,
                sum_insured: sumAssured,
                age,
                completed: true,
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [age, isSmoker, performCalculation, policyTerm, sumAssured, type])

    useCalculationSave(
        'premium-calculator',
        { type, sumAssured, age, gender, isSmoker, occupation, location, selectedRiders, policyTerm },
        performCalculation,
    )

    const toggleRider = (id: string) => {
        setSelectedRiders((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Breadcrumbs />
            <header className="mb-8 text-center animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm rounded-full mb-4 font-semibold shadow-glow-sm">
                    <Zap className="w-4 h-4" />
                    {t('badge')}
                </div>
                <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl text-theme-primary">
                    {t('title')}
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-theme-secondary">
                    {t('subtitle')}
                </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-6">
                    <section className="glass rounded-3xl p-8 shadow-md border border-default relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 p-4 opacity-[0.03] pointer-events-none">
                            <Calculator className="w-40 h-40" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                <Users className="w-6 h-6 text-accent" />
                                {t('sections.profileTitle')}
                            </h2>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-theme-secondary rounded-lg border border-default">
                                <Activity className="w-4 h-4 text-accent" />
                                <span className="text-xs font-medium text-theme-secondary">{t('sections.realTimeAnalysis')}</span>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-semibold text-theme-primary">{t('fields.age')}</label>
                                        <span className="text-accent font-bold">{age}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={18}
                                        max={75}
                                        value={age}
                                        onChange={(e) => setAge(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        aria-label={t('fields.ageAria')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <div className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
                                            {t('fields.policyTerm')}
                                            <div className="group relative">
                                                <Info className="w-3.5 h-3.5 text-theme-muted cursor-help" />
                                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-theme-primary border border-default rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                                                    {t('fields.policyTermTooltip')}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-accent font-bold">{policyTerm} {t('units.yearsShort')}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={5}
                                        max={40}
                                        step={5}
                                        value={policyTerm}
                                        onChange={(e) => setPolicyTerm(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                        aria-label={t('fields.policyTermAria')}
                                    />
                                    <div className="flex justify-between text-[10px] text-theme-muted font-medium">
                                        <span>{t('units.fiveYears')}</span>
                                        <span>{t('units.twentyYears')}</span>
                                        <span>{t('units.fortyYears')}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">{t('fields.gender')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {GENDERS.map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${gender === g
                                                    ? 'bg-accent text-white shadow-glow'
                                                    : 'bg-theme-secondary text-theme-secondary hover:bg-accent/5'
                                                    }`}
                                            >
                                                {t(`gender.${g}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold text-theme-primary flex items-center gap-2">
                                        {t('fields.smokingStatus')}
                                        <div className="group relative">
                                            <Info className="w-3.5 h-3.5 text-theme-muted cursor-help" />
                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-theme-primary border border-default rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                                                {t('fields.smokingTooltip')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex bg-theme-secondary p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setIsSmoker(false)}
                                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${!isSmoker ? 'bg-theme-primary shadow-sm text-accent' : 'text-theme-secondary hover:text-theme-primary'}`}
                                        >
                                            {t('smoking.nonSmoker')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsSmoker(true)}
                                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${isSmoker ? 'bg-theme-primary shadow-sm text-red-500' : 'text-theme-secondary hover:text-theme-primary'}`}
                                        >
                                            {t('smoking.smoker')}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">{t('fields.location')}</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="input pl-10"
                                            aria-label={t('fields.locationAria')}
                                        >
                                            {LOCATIONS.map((loc) => (
                                                <option key={loc.value} value={loc.value}>{t(loc.labelKey)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-default opacity-50" />

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">{t('fields.insuranceType')}</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as InsuranceType)}
                                        className="input"
                                        aria-label={t('fields.insuranceTypeAria')}
                                    >
                                        {INSURANCE_TYPES.map((insuranceType) => (
                                            <option key={insuranceType} value={insuranceType}>
                                                {t(`insuranceTypes.${insuranceType}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">{t('fields.sumAssured')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SUM_ASSURED_OPTIONS.map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => setSumAssured(value)}
                                                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${sumAssured === value
                                                    ? 'bg-accent/10 border-accent text-accent'
                                                    : 'bg-theme-primary border-default text-theme-secondary hover:border-accent/20'
                                                    }`}
                                            >
                                                {value >= 10000000 ? t('sumAssured.oneCrorePlus') : formatCurrency(value)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">{t('fields.jobNature')}</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                                        <select
                                            value={occupation}
                                            onChange={(e) => setOccupation(e.target.value)}
                                            className="input pl-10"
                                            aria-label={t('fields.jobNatureAria')}
                                        >
                                            {OCCUPATIONS.map((item) => (
                                                <option key={item.value} value={item.value}>{t(item.labelKey)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">{t('fields.riders')}</label>
                                    <div className="grid gap-2">
                                        {RIDERS.map((rider) => (
                                            <button
                                                key={rider.id}
                                                onClick={() => toggleRider(rider.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${selectedRiders.includes(rider.id)
                                                    ? 'bg-accent/5 border-accent/20'
                                                    : 'bg-theme-secondary border-transparent'
                                                    }`}
                                            >
                                                <span className={selectedRiders.includes(rider.id) ? 'text-theme-primary' : 'text-theme-secondary'}>
                                                    {t(rider.labelKey)}
                                                </span>
                                                {selectedRiders.includes(rider.id) && <CheckCircle className="w-4 h-4 text-accent" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-3xl p-8 shadow-xl border-t-4 border-accent relative overflow-hidden"
                    >
                        <div className="flex flex-col items-center text-center">
                            <span className="text-sm font-medium text-theme-muted mb-2">{t('premium.indicativeYearlyPremium')}</span>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={premium}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-5xl font-black text-theme-primary mb-1 tracking-tight"
                                >
                                    {isCalculating ? '...' : formatCurrency(premium)}
                                </motion.div>
                            </AnimatePresence>

                            {performCalculation.gstRate === 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-success-500 text-xs font-semibold bg-success-50 px-3 py-1 rounded-full border border-success-500/25">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {t('premium.gstExempt')}
                                </span>
                            ) : (
                                <span className="text-theme-secondary text-xs font-medium bg-theme-secondary px-3 py-1 rounded-full border border-default">
                                    {t('premium.includingGst', { gst: formatCurrency(gstAmount) })}
                                </span>
                            )}
                        </div>

                        <div className="mt-10 space-y-6">
                            <h4 className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent" />
                                {t('premium.composition')}
                            </h4>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-theme-secondary">{t('premium.breakdown.baseCover')}</span>
                                        <span className="text-theme-primary">{premium > 0 ? Math.round((breakdown.base / premium) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-theme-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: premium > 0 ? `${Math.max(0, (breakdown.base / premium) * 100)}%` : 0 }}
                                            className="h-full bg-accent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-theme-secondary">{t('premium.breakdown.riskCharges')}</span>
                                        <span className="text-theme-primary">{premium > 0 ? Math.round((breakdown.risk / premium) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-theme-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: premium > 0 ? `${Math.max(0, (breakdown.risk / premium) * 100)}%` : 0 }}
                                            className="h-full bg-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-theme-secondary">{t('premium.breakdown.riders')}</span>
                                        <span className="text-theme-primary">{premium > 0 ? Math.round((breakdown.riders / premium) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-theme-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: premium > 0 ? `${Math.max(0, (breakdown.riders / premium) * 100)}%` : 0 }}
                                            className="h-full bg-accent"
                                        />
                                    </div>
                                </div>

                                {performCalculation.gstRate > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-amber-600 dark:text-amber-400">{t('premium.breakdown.gstVehicle')}</span>
                                            <span className="text-amber-600 dark:text-amber-400">{formatCurrency(gstAmount)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-theme-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: premium > 0 ? `${Math.max(0, (gstAmount / premium) * 100)}%` : 0 }}
                                                className="h-full bg-orange-400"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-accent/5 rounded-2xl border border-accent/10 text-center">
                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{t('premium.precisionScore')}</div>
                            <div className="text-2xl font-black text-accent">{confidence}%</div>
                            <p className="text-[10px] text-theme-secondary mt-1">{t('premium.precisionScoreHint')}</p>
                        </div>

                        <Link href="/resources" className="btn-primary w-full mt-8 group flex items-center justify-center">
                            {t('premium.exploreGuides')}
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>

                    <div className="glass rounded-3xl p-6 border border-default">
                        <h3 className="mb-4 font-bold text-theme-primary text-sm flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-accent" />
                            {t('tips.title')}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-xs leading-relaxed">
                                <div className="w-6 h-6 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-3 h-3 text-success-500" />
                                </div>
                                <p className="text-theme-secondary">
                                    <strong className="text-theme-primary">{t('tips.buyEarlyTitle')}</strong> {t('tips.buyEarlyDescription')}
                                </p>
                            </div>
                            <div className="flex gap-3 text-xs leading-relaxed">
                                <div className="w-6 h-6 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 text-success-500" />
                                </div>
                                <p className="text-theme-secondary">
                                    <strong className="text-theme-primary">{t('tips.annualPaymentsTitle')}</strong> {t('tips.annualPaymentsDescription')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 rounded-2xl border border-amber-200 dark:border-amber-800/40 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setRegulatoryOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                    <span className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        {regulatoryT('prominent.title')}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-amber-600 transition-transform duration-300 ${regulatoryOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                <AnimatePresence initial={false}>
                    {regulatoryOpen && (
                        <motion.div
                            key="reg"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 py-4 bg-amber-50/50 dark:bg-amber-900/10 text-xs text-amber-800 dark:text-amber-300 space-y-2 leading-relaxed">
                                <p>{regulatoryT('body')}</p>
                                <p className="text-amber-700 dark:text-amber-400">
                                    <strong>{regulatoryT('prominent.weDoNotLabel')}</strong> {regulatoryT('prominent.weDoNotItems')}
                                </p>
                                <div className="space-y-1">
                                    <p><strong>{regulatoryT('prominent.complaintsLabel')}</strong></p>
                                    <div className="flex flex-wrap gap-2">
                                        <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noopener noreferrer" className="underline">
                                            {regulatoryT('prominent.complaintsPortal')}
                                        </a>
                                        <a href="https://irdai.gov.in" target="_blank" rel="noopener noreferrer" className="underline">
                                            {regulatoryT('prominent.irdaiWebsite')}
                                        </a>
                                        <a href={`mailto:${regulatoryT('prominent.complaintsEmail')}`} className="underline">
                                            {regulatoryT('prominent.complaintsEmail')}
                                        </a>
                                        <span>{regulatoryT('prominent.complaintsPhones')}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
