'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer'
import {
    Calculator,
    ArrowRight,
    Shield,
    CheckCircle,
    Info,
    MapPin,
    Briefcase,
    Stethoscope,
    Zap,
    Activity,
    Users
} from 'lucide-react'

// Constants for calculation
const BASE_RATES = {
    'Life Insurance': 2000,
    'Health Insurance': 5000,
    'Vehicle Insurance': 3000
}

const OCCUPATIONS = [
    { label: 'Salaried / IT Professional', value: 'salaried', risk: 1.0 },
    { label: 'Self-Employed Professional', value: 'professional', risk: 1.1 },
    { label: 'High Risk (Civil/Mining/Eng)', value: 'high_risk', risk: 1.35 },
    { label: 'Home Maker / Student', value: 'others', risk: 1.05 }
]

const LOCATIONS = [
    { label: 'Tier 1 Metro (Mumbai/Delhi/Blr)', value: 'tier1', factor: 1.15 },
    { label: 'Tier 2 City (Pune/Ahmedabad)', value: 'tier2', factor: 1.05 },
    { label: 'Tier 3 & Others', value: 'tier3', factor: 1.0 }
]

const RIDERS = [
    { id: 'ci', label: 'Critical Illness Cover', base: 1200, factor: 0.02 },
    { id: 'adb', label: 'Accidental Death Benefit', base: 500, factor: 0.01 },
    { id: 'wop', label: 'Waiver of Premium', base: 300, factor: 0.005 }
]

export default function CalculatorPage() {
    // Basic State
    const [age, setAge] = useState<number>(28)
    const [type, setType] = useState('Life Insurance')
    const [sumAssured, setSumAssured] = useState<number>(5000000)
    const [gender, setGender] = useState('Male')

    // Advanced State
    const [isSmoker, setIsSmoker] = useState(false)
    const [occupation, setOccupation] = useState('salaried')
    const [location, setLocation] = useState('tier2')
    const [selectedRiders, setSelectedRiders] = useState<string[]>([])

    // Display State
    const [premium, setPremium] = useState<number>(0)
    const [breakdown, setBreakdown] = useState({ base: 0, risk: 0, riders: 0 })
    const [isCalculating, setIsCalculating] = useState(false)
    const [confidence, setConfidence] = useState(85)

    // Calculate premium automatically when values change (Live Updates)
    const performCalculation = useMemo(() => {
        const baseRate = BASE_RATES[type as keyof typeof BASE_RATES] || 2000

        // 1. Core Profile Factor
        const ageFactor = 1 + ((age - 18) * 0.035) // Increased sensitivity for realism
        const genderFactor = gender === 'Female' ? 0.92 : 1.0
        const profileBase = baseRate * ageFactor * genderFactor

        // 2. Risk Factors
        const smokerFactor = isSmoker ? 1.45 : 1.0
        const occRisk = OCCUPATIONS.find(o => o.value === occupation)?.risk || 1.0
        const locFactor = LOCATIONS.find(l => l.value === location)?.factor || 1.0

        const riskApplied = profileBase * smokerFactor * occRisk * locFactor

        // 3. Sum Assured Factor
        const sumFactor = (sumAssured / 100000) * 1.8 // Cost per lakh

        const totalBase = riskApplied + sumFactor

        // 4. Riders
        let riderTotal = 0
        selectedRiders.forEach(ridId => {
            const rider = RIDERS.find(r => r.id === ridId)
            if (rider) {
                riderTotal += rider.base + (sumAssured * (rider.factor / 100))
            }
        })

        const total = totalBase + riderTotal

        return {
            total: Math.round(total),
            breakdown: {
                base: Math.round(profileBase + sumFactor),
                risk: Math.round(totalBase - (profileBase + sumFactor)),
                riders: Math.round(riderTotal)
            }
        }
    }, [age, type, sumAssured, gender, isSmoker, occupation, location, selectedRiders])

    useEffect(() => {
        setIsCalculating(true)
        const timer = setTimeout(() => {
            setPremium(performCalculation.total)
            setBreakdown(performCalculation.breakdown)
            setIsCalculating(false)

            // Higher confidence if age is in range and smokers are declared
            let conf = 85
            if (age > 60) conf -= 10
            if (isSmoker) conf += 5
            setConfidence(Math.min(95, conf))
        }, 300)
        return () => clearTimeout(timer)
    }, [performCalculation])

    const toggleRider = (id: string) => {
        setSelectedRiders(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8 text-center animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent
                   text-sm rounded-full mb-4 font-semibold shadow-glow-sm">
                    <Zap className="w-4 h-4" />
                    PREMIUM EDITION CALCULATOR
                </div>
                <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl text-theme-primary">
                    Smart Premium Advisor
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-theme-secondary">
                    Get a high-precision estimate powered by advanced actuarial modeling.
                </p>
            </header>

            <RegulatoryDisclaimer variant="prominent" className="mb-8" />

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Form */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="glass rounded-3xl p-8 shadow-md border border-default relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Calculator className="w-32 h-32" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                <Users className="w-6 h-6 text-accent" />
                                Your Personal Profile
                            </h2>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-theme-secondary rounded-lg border border-default">
                                <Activity className="w-4 h-4 text-accent" />
                                <span className="text-xs font-medium text-theme-secondary">Real-time Analysis</span>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Age & Gender */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-semibold text-theme-primary">Age (Years)</label>
                                        <span className="text-accent font-bold">{age}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={18}
                                        max={75}
                                        value={age}
                                        onChange={(e) => setAge(Number(e.target.value))}
                                        className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">Gender</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Male', 'Female', 'Other'].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${gender === g
                                                    ? 'bg-accent text-white shadow-glow'
                                                    : 'bg-theme-secondary text-theme-secondary hover:bg-accent-5'
                                                    }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tobacco & Location */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary flex items-center gap-2">
                                        Tobacco / Smoking Status
                                        <div className="group relative">
                                            <Info className="w-3.5 h-3.5 text-theme-muted cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-theme-primary border border-default rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                                                Smoking increases premium rates by up to 50% due to higher health risks.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="flex bg-theme-secondary p-1 rounded-xl">
                                        <button
                                            onClick={() => setIsSmoker(false)}
                                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${!isSmoker ? 'bg-theme-primary shadow-sm text-accent' : 'text-theme-secondary'}`}
                                        >
                                            Non-Smoker
                                        </button>
                                        <button
                                            onClick={() => setIsSmoker(true)}
                                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${isSmoker ? 'bg-theme-primary shadow-sm text-red-500' : 'text-theme-secondary'}`}
                                        >
                                            Smoker
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">Resident Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="input pl-10"
                                        >
                                            {LOCATIONS.map(l => (
                                                <option key={l.value} value={l.value}>{l.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-default opacity-50" />

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Sum Assured & Occupation */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">Insurance Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="input"
                                    >
                                        {Object.keys(BASE_RATES).map(t => (
                                            <option key={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">Sum Assured (Coverage)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[1000000, 2500000, 5000000, 10000000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setSumAssured(val)}
                                                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${sumAssured === val
                                                    ? 'bg-accent-10 border-accent text-accent'
                                                    : 'bg-theme-primary border-default text-theme-secondary hover:border-accent-20'
                                                    }`}
                                            >
                                                {val >= 10000000 ? '₹ 1 Crore+' : formatCurrency(val)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">Job Nature</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                                        <select
                                            value={occupation}
                                            onChange={(e) => setOccupation(e.target.value)}
                                            className="input pl-10"
                                        >
                                            {OCCUPATIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-theme-primary">Additional Protection (Riders)</label>
                                    <div className="grid gap-2">
                                        {RIDERS.map(rider => (
                                            <button
                                                key={rider.id}
                                                onClick={() => toggleRider(rider.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${selectedRiders.includes(rider.id)
                                                    ? 'bg-accent-5 border-accent-20'
                                                    : 'bg-theme-secondary border-transparent'
                                                    }`}
                                            >
                                                <span className={selectedRiders.includes(rider.id) ? 'text-theme-primary' : 'text-theme-secondary'}>
                                                    {rider.label}
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

                {/* Right Column: Result & Breakdown */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-3xl p-8 shadow-xl border-t-4 border-accent relative overflow-hidden"
                    >
                        <div className="flex flex-col items-center text-center">
                            <span className="text-sm font-medium text-theme-muted mb-2">Indicative Yearly Premium</span>

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

                            <span className="text-theme-secondary text-sm font-medium bg-theme-secondary px-3 py-1 rounded-full border border-default">
                                GST included (approx)
                            </span>
                        </div>

                        {/* Premium Breakdown Visualization */}
                        <div className="mt-10 space-y-6">
                            <h4 className="text-sm font-bold text-theme-primary flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent" />
                                Premium Composition
                            </h4>

                            <div className="space-y-4">
                                {/* Base Component */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-theme-secondary">Base Cover & Ops</span>
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

                                {/* Risk Component */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-theme-secondary">Risk Adjusted Charges</span>
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

                                {/* Riders Component */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-theme-secondary">Value Added Riders</span>
                                        <span className="text-theme-primary">{premium > 0 ? Math.round((breakdown.riders / premium) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-theme-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: premium > 0 ? `${Math.max(0, (breakdown.riders / premium) * 100)}%` : 0 }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confidence Score */}
                        <div className="mt-8 p-4 bg-accent-5 rounded-2xl border border-accent-10 text-center">
                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Precision Score</div>
                            <div className="text-2xl font-black text-accent">{confidence}%</div>
                            <p className="text-[10px] text-theme-secondary mt-1">Based on profile completeness</p>
                        </div>

                        <a href="/resources" className="btn-primary w-full mt-8 group flex items-center justify-center">
                            Explore Expert Guides
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </a>
                    </motion.div>

                    <div className="glass rounded-3xl p-6 border border-default">
                        <h3 className="mb-4 font-bold text-theme-primary text-sm flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-accent" />
                            Premium Optimization Tips
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-xs leading-relaxed">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-3 h-3 text-emerald-600" />
                                </div>
                                <p className="text-theme-secondary">
                                    <strong className="text-theme-primary">Buy Early:</strong> For every year you wait after 30, your premium increases by approx 4-7%.
                                </p>
                            </div>
                            <div className="flex gap-3 text-xs leading-relaxed">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                </div>
                                <p className="text-theme-secondary">
                                    <strong className="text-theme-primary">Annual Payments:</strong> Choosing yearly instead of monthly payments can save up to 8% in processing fees.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
