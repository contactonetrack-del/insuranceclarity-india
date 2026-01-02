'use client'

import { useState } from 'react'
import { Scale, Check, X, Info, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Policy {
    id: string
    name: string
    type: string
    premium: string
    cover: string
    csr: string
    features: string[]
    pros: string[]
    cons: string[]
}

const samplePolicies: Policy[] = [
    {
        id: '1',
        name: 'LIC Tech Term',
        type: 'Term Life',
        premium: '₹8,400/year',
        cover: '₹1 Crore',
        csr: '99.97%',
        features: ['Age 18-65', '5-40 year term', 'Online discount'],
        pros: ['Highest CSR', 'Government backing', 'Loan facility'],
        cons: ['Higher premium than private', 'Less riders'],
    },
    {
        id: '2',
        name: 'HDFC Click 2 Protect',
        type: 'Term Life',
        premium: '₹6,800/year',
        cover: '₹1 Crore',
        csr: '98.54%',
        features: ['Age 18-65', 'Death + CI options', 'Life Plus option'],
        pros: ['Competitive premium', 'Many riders', 'Good claim process'],
        cons: ['Private company', 'Slightly lower CSR'],
    },
    {
        id: '3',
        name: 'ICICI iProtect Smart',
        type: 'Term Life',
        premium: '₹7,200/year',
        cover: '₹1 Crore',
        csr: '98.68%',
        features: ['Age 18-60', 'Income benefit option', 'Terminal illness'],
        pros: ['Strong brand', 'Flexible payout', 'Terminal illness benefit'],
        cons: ['Max age 60', 'Standard riders'],
    },
]

export default function ComparePage() {
    const [selected, setSelected] = useState<string[]>(['1', '2'])

    const togglePolicy = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id))
        } else if (selected.length < 3) {
            setSelected([...selected, id])
        }
    }

    const selectedPolicies = samplePolicies.filter(p => selected.includes(p.id))

    return (
        <div className="min-h-screen pt-20">
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent 
                                   text-sm rounded-full mb-4 font-medium">
                        <Scale className="w-4 h-4" />
                        COMPARE POLICIES
                    </span>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                        Compare Insurance Policies
                    </h1>
                    <p className="text-theme-secondary max-w-2xl mx-auto">
                        Side-by-side comparison of features, premiums, and claim settlement ratios.
                    </p>
                </div>
            </section>

            <section className="py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-lg text-theme-primary font-medium mb-4">
                        Select Policies to Compare (Max 3)
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {samplePolicies.map((policy) => (
                            <button
                                key={policy.id}
                                onClick={() => togglePolicy(policy.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium 
                                  transition-all duration-200 ${selected.includes(policy.id)
                                        ? 'bg-gradient-accent text-white shadow-md'
                                        : 'glass text-theme-secondary hover:text-accent hover:border-hover'
                                    }`}
                            >
                                {policy.name}
                                {selected.includes(policy.id) && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {selectedPolicies.length >= 2 && (
                <section className="py-8 px-6">
                    <div className="max-w-7xl mx-auto overflow-x-auto">
                        <table className="w-full text-left border-collapse glass rounded-xl overflow-hidden">
                            <thead>
                                <tr className="border-b border-default bg-accent-5">
                                    <th className="py-4 px-4 text-theme-secondary font-medium">Feature</th>
                                    {selectedPolicies.map(p => (
                                        <th key={p.id} className="py-4 px-4 text-theme-primary font-semibold">{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Type</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-theme-primary">{p.type}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Premium</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-accent font-semibold">{p.premium}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Cover</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-theme-primary">{p.cover}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">CSR</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-accent font-bold">{p.csr}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Key Features</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-theme-secondary text-sm">
                                            {p.features.map((f, i) => <div key={i}>• {f}</div>)}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400">Pros</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-sm">
                                            {p.pros.map((pro, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                                                    <Check className="w-3.5 h-3.5 flex-shrink-0" /> {pro}
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-red-600 dark:text-red-400">Cons</td>
                                    {selectedPolicies.map(p => (
                                        <td key={p.id} className="py-4 px-4 text-sm">
                                            {p.cons.map((con, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-red-600 dark:text-red-400 mb-1">
                                                    <X className="w-3.5 h-3.5 flex-shrink-0" /> {con}
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <section className="py-8 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <p className="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            This is a demo comparison. Actual comparison tool will fetch real-time quotes.
                        </p>
                    </Card>
                </div>
            </section>
        </div>
    )
}
