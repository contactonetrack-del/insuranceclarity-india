'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, ArrowRight, Info, Heart, Building2, Car, Bike, Sparkles } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    GlassCard,
    MagicButton,
    AnimatedHeading,
    IconContainer
} from '@/components/premium'
import { formatCurrency } from '@/lib/utils'

type InsuranceType = 'term-life' | 'health' | 'motor-car' | 'motor-bike'

interface CalculatorState {
    type: InsuranceType
    age: number
    sum: number
    term: number
    smoker: boolean
    vehicleAge: number
    idv: number
}

const insuranceTypes = [
    { id: 'term-life' as InsuranceType, label: 'Term Life', icon: Heart, color: 'from-red-500 to-pink-600' },
    { id: 'health' as InsuranceType, label: 'Health', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { id: 'motor-car' as InsuranceType, label: 'Car', icon: Car, color: 'from-blue-500 to-indigo-600' },
    { id: 'motor-bike' as InsuranceType, label: 'Bike', icon: Bike, color: 'from-purple-500 to-violet-600' },
]

function calculatePremium(state: CalculatorState): { min: number; max: number; avg: number } {
    const { type, age, sum, term, smoker, vehicleAge, idv } = state

    switch (type) {
        case 'term-life': {
            let baseRate = 0
            if (age <= 25) baseRate = 8
            else if (age <= 30) baseRate = 10
            else if (age <= 35) baseRate = 14
            else if (age <= 40) baseRate = 20
            else if (age <= 45) baseRate = 30
            else if (age <= 50) baseRate = 45
            else baseRate = 70

            if (smoker) baseRate *= 1.5

            const annualPremium = (sum / 100000) * baseRate * 12
            return {
                min: Math.round(annualPremium * 0.8),
                max: Math.round(annualPremium * 1.3),
                avg: Math.round(annualPremium),
            }
        }

        case 'health': {
            let baseRate = 0
            if (age <= 25) baseRate = 4000
            else if (age <= 35) baseRate = 6000
            else if (age <= 45) baseRate = 10000
            else if (age <= 55) baseRate = 18000
            else if (age <= 65) baseRate = 30000
            else baseRate = 50000

            const sumFactor = sum / 500000
            const annualPremium = baseRate * sumFactor
            return {
                min: Math.round(annualPremium * 0.7),
                max: Math.round(annualPremium * 1.4),
                avg: Math.round(annualPremium),
            }
        }

        case 'motor-car': {
            const tp = 2094
            let odRate = 0.028
            if (vehicleAge <= 1) odRate = 0.028
            else if (vehicleAge <= 2) odRate = 0.026
            else if (vehicleAge <= 3) odRate = 0.024
            else if (vehicleAge <= 5) odRate = 0.022
            else odRate = 0.02

            const od = idv * odRate
            const annualPremium = tp + od

            return {
                min: Math.round(annualPremium * 0.85),
                max: Math.round(annualPremium * 1.25),
                avg: Math.round(annualPremium),
            }
        }

        case 'motor-bike': {
            const tp = 714
            let odRate = 0.02
            if (vehicleAge <= 2) odRate = 0.022
            else if (vehicleAge <= 5) odRate = 0.018
            else odRate = 0.015

            const od = idv * odRate
            const annualPremium = tp + od

            return {
                min: Math.round(annualPremium * 0.8),
                max: Math.round(annualPremium * 1.2),
                avg: Math.round(annualPremium),
            }
        }

        default:
            return { min: 0, max: 0, avg: 0 }
    }
}

export default function CalculatorPage() {
    const [state, setState] = useState<CalculatorState>({
        type: 'term-life',
        age: 30,
        sum: 10000000,
        term: 30,
        smoker: false,
        vehicleAge: 1,
        idv: 800000,
    })

    const [calculated, setCalculated] = useState(false)
    const [result, setResult] = useState({ min: 0, max: 0, avg: 0 })

    const handleCalculate = () => {
        const premium = calculatePremium(state)
        setResult(premium)
        setCalculated(true)
    }

    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            {/* Hero */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="down">
                        <span className="inline-flex items-center gap-2 px-4 py-2 glass border-primary-500/30 
                             text-primary-500 text-sm rounded-full mb-4 font-medium">
                            <Sparkles className="w-4 h-4" /> PREMIUM CALCULATOR
                        </span>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.1}>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                            <AnimatedHeading text="Insurance Premium Calculator" />
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <p className="text-theme-secondary max-w-xl mx-auto text-lg">
                            Get instant premium estimates for Life, Health, and Motor insurance.
                            These are indicative values - actual premiums may vary.
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Calculator */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll direction="up" delay={0.3}>
                        <GlassCard padding="lg" className="relative overflow-hidden">
                            {/* Insurance Type Selector */}
                            <div className="mb-8">
                                <label className="block text-sm text-theme-secondary mb-3 font-medium">Select Insurance Type</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {insuranceTypes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setState({ ...state, type: t.id })
                                                setCalculated(false)
                                            }}
                                            className={`p-4 rounded-xl border text-center transition-all duration-300 ${state.type === t.id
                                                ? 'bg-gradient-accent border-transparent text-white shadow-lg scale-105'
                                                : 'glass text-theme-secondary hover:border-accent/50 hover:bg-accent/5'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center transition-colors
                                              ${state.type === t.id
                                                    ? 'bg-white/20'
                                                    : `bg-gradient-to-br ${t.color}`}`}>
                                                <t.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                            </div>
                                            <span className="text-sm font-medium">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form Fields based on type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Age (for life and health) */}
                                {(state.type === 'term-life' || state.type === 'health') && (
                                    <div>
                                        <label className="block text-sm text-theme-secondary mb-2">Your Age</label>
                                        <input
                                            type="number"
                                            value={state.age}
                                            onChange={(e) => setState({ ...state, age: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 glass rounded-xl text-theme-primary focus:border-primary-500 focus:outline-none transition-all"
                                            min={18}
                                            max={65}
                                        />
                                    </div>
                                )}

                                {/* Sum Insured (for life and health) */}
                                {(state.type === 'term-life' || state.type === 'health') && (
                                    <div>
                                        <label className="block text-sm text-theme-secondary mb-2">
                                            {state.type === 'term-life' ? 'Cover Amount' : 'Sum Insured'}
                                        </label>
                                        <select
                                            value={state.sum}
                                            onChange={(e) => setState({ ...state, sum: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 glass rounded-xl text-theme-primary focus:border-primary-500 focus:outline-none transition-all"
                                        >
                                            {state.type === 'term-life' ? (
                                                <>
                                                    <option value={5000000}>₹50 Lakhs</option>
                                                    <option value={10000000}>₹1 Crore</option>
                                                    <option value={20000000}>₹2 Crore</option>
                                                    <option value={50000000}>₹5 Crore</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value={300000}>₹3 Lakhs</option>
                                                    <option value={500000}>₹5 Lakhs</option>
                                                    <option value={1000000}>₹10 Lakhs</option>
                                                    <option value={2500000}>₹25 Lakhs</option>
                                                    <option value={5000000}>₹50 Lakhs</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {/* Smoker (for term life) */}
                                {state.type === 'term-life' && (
                                    <div>
                                        <label className="block text-sm text-theme-secondary mb-2">Smoker/Tobacco User?</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setState({ ...state, smoker: false })}
                                                className={`flex-1 py-3 rounded-xl border transition-all ${!state.smoker
                                                    ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                                                    : 'glass text-theme-secondary hover:border-primary-500/30'
                                                    }`}
                                            >
                                                No
                                            </button>
                                            <button
                                                onClick={() => setState({ ...state, smoker: true })}
                                                className={`flex-1 py-3 rounded-xl border transition-all ${state.smoker
                                                    ? 'bg-red-500/10 border-red-500 text-red-500'
                                                    : 'glass text-theme-secondary hover:border-red-500/30'
                                                    }`}
                                            >
                                                Yes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Term (for term life) */}
                                {state.type === 'term-life' && (
                                    <div>
                                        <label className="block text-sm text-theme-secondary mb-2">Policy Term (Years)</label>
                                        <select
                                            value={state.term}
                                            onChange={(e) => setState({ ...state, term: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 glass rounded-xl text-theme-primary focus:border-primary-500 focus:outline-none transition-all"
                                        >
                                            <option value={10}>10 Years</option>
                                            <option value={20}>20 Years</option>
                                            <option value={30}>30 Years</option>
                                            <option value={40}>40 Years</option>
                                        </select>
                                    </div>
                                )}

                                {/* Vehicle Age (for motor) */}
                                {(state.type === 'motor-car' || state.type === 'motor-bike') && (
                                    <div>
                                        <label className="block text-sm text-theme-secondary mb-2">Vehicle Age (Years)</label>
                                        <select
                                            value={state.vehicleAge}
                                            onChange={(e) => setState({ ...state, vehicleAge: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 glass rounded-xl text-theme-primary focus:border-primary-500 focus:outline-none transition-all"
                                        >
                                            <option value={0}>Brand New</option>
                                            <option value={1}>1 Year</option>
                                            <option value={2}>2 Years</option>
                                            <option value={3}>3 Years</option>
                                            <option value={5}>5 Years</option>
                                            <option value={7}>7+ Years</option>
                                        </select>
                                    </div>
                                )}

                                {/* IDV (for motor) */}
                                {(state.type === 'motor-car' || state.type === 'motor-bike') && (
                                    <div>
                                        <label className="block text-sm text-theme-secondary mb-2">
                                            IDV (Vehicle Value) in ₹
                                        </label>
                                        <input
                                            type="number"
                                            value={state.idv}
                                            onChange={(e) => setState({ ...state, idv: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 glass rounded-xl text-theme-primary focus:border-primary-500 focus:outline-none transition-all"
                                            step={10000}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Calculate Button */}
                            <div className="flex justify-center mt-8">
                                <MagicButton onClick={handleCalculate} size="lg" icon={Calculator} glow>
                                    Calculate Premium
                                </MagicButton>
                            </div>

                            {/* Results */}
                            {calculated && (
                                <div className="mt-8 p-6 glass-strong rounded-2xl border border-accent/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="font-display font-semibold text-lg text-theme-primary mb-4 text-center">
                                        Estimated Annual Premium
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-theme-muted text-sm mb-1">Min</div>
                                            <div className="font-display font-bold text-xl text-theme-secondary">
                                                {formatCurrency(result.min)}
                                            </div>
                                        </div>
                                        <div className="border-x border-accent/20 relative">
                                            <div className="absolute inset-0 bg-accent/5 blur-xl -z-10"></div>
                                            <div className="text-accent text-sm font-bold mb-1">Average</div>
                                            <div className="font-display font-bold text-2xl text-accent drop-shadow-sm">
                                                {formatCurrency(result.avg)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-theme-muted text-sm mb-1">Max</div>
                                            <div className="font-display font-bold text-xl text-theme-secondary">
                                                {formatCurrency(result.max)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            These are indicative premiums. Actual quotes depend on health conditions,
                                            occupation, lifestyle, and insurer-specific factors.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </RevealOnScroll>

                    {/* Tips */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RevealOnScroll direction="left" delay={0.4}>
                            <GlassCard hover className="h-full border-l-4 border-l-green-500" padding="md">
                                <h4 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
                                    <span className="text-xl">💡</span> Save on Premium
                                </h4>
                                <ul className="text-sm text-theme-secondary space-y-2">
                                    <li className="flex items-center gap-2">• Buy online for 20-30% lower rates</li>
                                    <li className="flex items-center gap-2">• Choose higher deductible for health</li>
                                    <li className="flex items-center gap-2">• Maintain NCB for motor insurance</li>
                                </ul>
                            </GlassCard>
                        </RevealOnScroll>

                        <RevealOnScroll direction="right" delay={0.5}>
                            <GlassCard hover className="h-full border-l-4 border-l-red-500" padding="md">
                                <h4 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
                                    <span className="text-xl">⚠️</span> Don't Compromise On
                                </h4>
                                <ul className="text-sm text-theme-secondary space-y-2">
                                    <li className="flex items-center gap-2">• Adequate sum insured</li>
                                    <li className="flex items-center gap-2">• Zero depreciation for new cars</li>
                                    <li className="flex items-center gap-2">• Critical illness add-on</li>
                                </ul>
                            </GlassCard>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>
        </div>
    )
}
