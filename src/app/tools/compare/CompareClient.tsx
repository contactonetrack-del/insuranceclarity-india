'use client'

import { useState, useEffect } from 'react'
import { Scale, Check, X } from 'lucide-react'
import { trackPolicyComparison } from '@/services/analytics.service'
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export interface Policy {
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

export default function CompareClient({ policies }: { policies: Policy[] }) {
    const [selected, setSelected] = useState<string[]>(policies.slice(0, 2).map((p) => p.id))

    useEffect(() => {
        if (selected.length > 0) {
            trackPolicyComparison({
                category: 'life', // Default cast since generic compare page, could be dynamic
                policyCount: selected.length,
            })
        }
    }, [selected])

    const togglePolicy = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id))
        } else if (selected.length < 3) {
            setSelected([...selected, id])
        }
    }

    const selectedPolicies = policies.filter((p) => selected.includes(p.id))

    return (
        <div className="min-h-screen pt-20">
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <Breadcrumbs />
                    <div className="text-center mt-4">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent 
                                       text-sm rounded-full mb-4 font-medium">
                            <Scale className="w-4 h-4" />
                            COMPARE POLICIES
                        </span>
                        <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                            Compare Insurance Policies
                        </h1>
                        <p className="text-theme-secondary max-w-2xl mx-auto">
                            Side-by-side comparison of features and claim settlement ratios.
                        </p>
                    </div>
                </div>
            </section>

            {/* Prominent Disclaimer */}
            <section className="px-6">
                <div className="max-w-4xl mx-auto">
                    <RegulatoryDisclaimer variant="prominent" />
                </div>
            </section>

            <section className="py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-lg text-theme-primary font-medium mb-4">
                        Select Policies to Compare (Max 3)
                    </h2>
                    {policies.length === 0 ? (
                        <p className="text-theme-secondary">No policies available for comparison at the moment.</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {policies.map((policy) => (
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
                    )}
                </div>
            </section>

            {selectedPolicies.length >= 2 && (
                <section className="py-8 px-6">
                    <div className="max-w-7xl mx-auto overflow-x-auto">
                        <table className="w-full text-left border-collapse glass rounded-xl overflow-hidden">
                            <thead>
                                <tr className="border-b border-default bg-accent-5">
                                    <th className="py-4 px-4 text-theme-secondary font-medium">Feature</th>
                                    {selectedPolicies.map((p) => (
                                        <th key={p.id} className="py-4 px-4 text-theme-primary font-semibold">{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Type</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-theme-primary">{p.type}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Premium</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-accent font-semibold">{p.premium}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Cover</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-theme-primary">{p.cover}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">CSR</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-accent font-bold">{p.csr}</td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-theme-secondary">Key Features</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-theme-secondary text-sm">
                                            {p.features?.map((f, i) => <div key={i}>• {f}</div>)}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-default">
                                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400">Pros</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-sm">
                                            {p.pros?.map((pro, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                                                    <Check className="w-3.5 h-3.5 flex-shrink-0" /> {pro}
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-red-600 dark:text-red-400">Cons</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-4 px-4 text-sm">
                                            {p.cons?.map((con, i) => (
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
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Methodology Disclosure */}
                    <div className="glass rounded-xl p-4 text-sm text-theme-secondary">
                        <h4 className="font-medium text-theme-primary mb-2">How We Compare</h4>
                        <ul className="space-y-1 text-xs">
                            <li>• <strong>Data Sources:</strong> IRDAI annual reports, insurer websites (Live Data)</li>
                            <li>• <strong>Methodology:</strong> Policies compared on publicly available features; this does not constitute a ranking or recommendation</li>
                            <li>• <strong>Limitations:</strong> Premiums, features, and terms change frequently. Always verify current details with the insurer.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}
