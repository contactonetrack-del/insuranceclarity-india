import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Lightbulb, Search } from 'lucide-react'
import Card from '@/components/ui/Card'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ClaimCase {
    id: string
    category: string
    title: string
    status: string
    amount: number
    issue: string
    details: string
    outcome: string
    lesson: string
}


const verdictStyles = {
    approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    partial: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
}

export default async function ClaimCasesPage() {
    let claimCases: ClaimCase[] = []
    try {
        claimCases = await prisma.claimCase.findMany({
            orderBy: { createdAt: 'desc' }
        }) as ClaimCase[]
    } catch (e) {
        console.error('Failed to load claim cases', e)
    }

    return (
        <div className="min-h-screen pt-20">
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Breadcrumbs />
                    <span className="inline-flex items-center gap-2 px-4 py-2 glass border-primary-500/30 
                         text-primary-500 text-sm rounded-full mb-4 mt-4 font-medium">
                        📋 REAL CLAIM CASES
                    </span>
                    <h1 className="font-display font-bold text-3xl text-theme-primary mb-4">
                        Real Insurance Claim Cases
                    </h1>
                    <p className="text-theme-secondary">
                        Learn from actual claim approvals and rejections. Real lessons from real cases.
                    </p>
                </div>
            </section>

            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {claimCases.map((caseItem) => (
                        <Card key={caseItem.id} hover className={`border-l-4 ${verdictStyles[caseItem.status as keyof typeof verdictStyles] || verdictStyles.rejected}`}>
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div>
                                    <span className="inline-block px-2 py-1 glass text-theme-secondary text-xs rounded-lg mb-2 uppercase">
                                        {caseItem.category}
                                    </span>
                                    <h3 className="font-display font-semibold text-lg text-theme-primary">{caseItem.title}</h3>
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${verdictStyles[caseItem.status as keyof typeof verdictStyles] || verdictStyles.rejected}`}>
                                    {caseItem.status === 'approved' && <><CheckCircle className="w-4 h-4" /> Approved</>}
                                    {caseItem.status === 'rejected' && <><XCircle className="w-4 h-4" /> Rejected</>}
                                    {caseItem.status === 'partial' && <><AlertTriangle className="w-4 h-4" /> Partial</>}
                                </div>
                            </div>

                            <p className="text-theme-secondary mb-4">{caseItem.issue}</p>

                            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-primary-500/10">
                                <div>
                                    <span className="text-theme-muted text-sm">Claim Amount: </span>
                                    <span className="text-theme-primary font-medium">₹{caseItem.amount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="text-accent font-medium">Lesson: </span>
                                        <span className="text-theme-secondary">{caseItem.lesson}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Link href="/tools/hidden-facts" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-accent 
                     text-white font-medium rounded-xl shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200">
                        <Search className="w-4 h-4" /> View Hidden Facts <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    )
}

