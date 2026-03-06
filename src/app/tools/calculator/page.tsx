'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer'
import { Calculator, ArrowRight, Shield, CheckCircle } from 'lucide-react'

export default function CalculatorPage() {
    const [age, setAge] = useState<number>(25)
    const [type, setType] = useState('Life Insurance')
    const [sumAssured, setSumAssured] = useState<number>(5000000)
    const [gender, setGender] = useState('Male')
    const [premium, setPremium] = useState<number>(0)
    const [isCalculating, setIsCalculating] = useState(false)

    const calculatePremium = () => {
        setIsCalculating(true)

        // Simulate calculation delay for effect
        setTimeout(() => {
            let baseRate = 0

            switch (type) {
                case 'Life Insurance': baseRate = 2000; break;
                case 'Health Insurance': baseRate = 5000; break;
                case 'Vehicle Insurance': baseRate = 3000; break;
                default: baseRate = 2000;
            }

            // Age factor (increases 2% per year over 18)
            const ageFactor = 1 + ((age - 18) * 0.02)

            // Gender factor (Females get 10% discount)
            const genderFactor = gender === 'Female' ? 0.9 : 1.0

            // Sum assured factor (per 1 Lakh)
            const sumFactor = sumAssured / 100000 * 0.5

            let total = (baseRate * ageFactor * genderFactor) + (sumFactor * 100)

            setPremium(Math.round(total))
            setIsCalculating(false)
        }, 600)
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent
                   text-sm rounded-full mb-4 font-medium">
                    <Calculator className="w-4 h-4" />
                    FREE TOOL
                </div>
                <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl text-theme-primary">
                    Premium Estimate Calculator
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-theme-secondary">
                    Get an indicative estimate for your insurance premium.
                    This tool uses sample data and is for educational purposes only.
                </p>
            </header>

            {/* Prominent Disclaimer */}
            <RegulatoryDisclaimer variant="prominent" className="mb-8" />

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Calculator Form */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass rounded-2xl p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-semibold text-theme-primary flex items-center gap-2">
                            <Shield className="w-5 h-5 text-accent" />
                            Enter Your Details
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-theme-secondary">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                    min={18}
                                    max={100}
                                    className="input"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-theme-secondary">Insurance Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="input"
                                >
                                    <option>Life Insurance</option>
                                    <option>Health Insurance</option>
                                    <option>Vehicle Insurance</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-theme-secondary">Sum Assured (₹)</label>
                                <select
                                    value={sumAssured}
                                    onChange={(e) => setSumAssured(Number(e.target.value))}
                                    className="input"
                                >
                                    <option value={500000}>₹ 5 Lakhs</option>
                                    <option value={1000000}>₹ 10 Lakhs</option>
                                    <option value={2500000}>₹ 25 Lakhs</option>
                                    <option value={5000000}>₹ 50 Lakhs</option>
                                    <option value={10000000}>₹ 1 Crore</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-theme-secondary">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="input"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={calculatePremium}
                                disabled={isCalculating}
                                className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Calculator className="w-4 h-4" />
                                {isCalculating ? 'Calculating...' : 'Calculate Premium'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Sidebar / Results Preview */}
                <div className="space-y-6">
                    <motion.div
                        layout
                        className="glass rounded-2xl p-6 border border-default"
                    >
                        <h3 className="mb-2 font-semibold text-theme-primary">Estimated Premium</h3>
                        <div className="mb-4 text-4xl font-bold text-accent">
                            {premium > 0 ? formatCurrency(premium) : '---'}
                            <span className="text-base font-normal text-theme-secondary">/year</span>
                        </div>
                        <p className="text-sm text-theme-secondary">
                            *This is an indicative premium based on your age ({age}) and sum assured ({formatCurrency(sumAssured)}). Final premium may vary based on medical tests.
                        </p>
                    </motion.div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="mb-4 font-semibold text-theme-primary">About this calculator</h3>
                        <ul className="space-y-3 text-sm text-theme-secondary text-left">
                            <li className="flex gap-2 items-center">
                                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                                No personal data stored
                            </li>
                            <li className="flex gap-2 items-center">
                                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                                Indicative estimates only
                            </li>
                            <li className="flex gap-2 items-center">
                                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                                Verify with insurers
                            </li>
                        </ul>
                        <p className="mt-4 text-xs text-theme-muted">
                            Note: Actual premiums depend on medical history, lifestyle, and insurer underwriting.
                            Always verify terms directly with the insurance company.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
