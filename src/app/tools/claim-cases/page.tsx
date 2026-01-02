import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, FileText, Lightbulb, Search } from 'lucide-react'
import Card from '@/components/ui/Card'

type Verdict = 'approved' | 'rejected' | 'partial'

interface ClaimCase {
    id: number
    category: string
    title: string
    verdict: Verdict
    amount: string
    summary: string
    lesson: string
}

const claimCases: ClaimCase[] = [
    // === LIFE INSURANCE REJECTIONS ===
    {
        id: 1,
        category: 'life',
        title: 'Term Life Claim Rejected - Hidden Diabetes',
        verdict: 'rejected',
        amount: '₹50 Lakhs',
        summary: 'Policyholder did not disclose Type 2 diabetes during application. Investigation revealed regular insulin purchases 2 years before policy.',
        lesson: 'Insurers check pharmacy records, hospital databases. Always disclose ALL conditions.',
    },
    {
        id: 2,
        category: 'life',
        title: 'Death Claim Rejected - Suicide Within 1 Year',
        verdict: 'rejected',
        amount: '₹1 Crore',
        summary: 'Policyholder died by suicide 8 months after buying policy. Suicide clause applies for first 12-24 months.',
        lesson: 'Suicide exclusion is standard. Family received only premium refund.',
    },
    {
        id: 3,
        category: 'life',
        title: 'Claim Rejected - Smoker Declared as Non-Smoker',
        verdict: 'rejected',
        amount: '₹75 Lakhs',
        summary: 'Lung cancer death. Autopsy showed long-term smoking. Policy was issued at non-smoker rates.',
        lesson: 'Medical tests can reveal smoking history. Declare honestly and pay correct premium.',
    },
    {
        id: 4,
        category: 'life',
        title: 'Policy Lapsed - Death During Grace Period Dispute',
        verdict: 'rejected',
        amount: '₹25 Lakhs',
        summary: 'Premium due March 1, death on March 20. Insurer claimed grace period ended March 15. Family disputes.',
        lesson: 'Set up auto-debit. Never let policy lapse. Know exact grace period dates.',
    },
    {
        id: 5,
        category: 'life',
        title: 'ULIP Claim Approved - Clean Disclosure',
        verdict: 'approved',
        amount: '₹40 Lakhs',
        summary: 'Heart attack after 6 years of policy. All medical history was disclosed at purchase. Smooth settlement.',
        lesson: 'Honest disclosure = hassle-free claims. Time since issuance also helps.',
    },

    // === HEALTH INSURANCE REJECTIONS ===
    {
        id: 6,
        category: 'health',
        title: 'Knee Replacement Rejected - Pre-existing Arthritis',
        verdict: 'rejected',
        amount: '₹4.5 Lakhs',
        summary: 'Policy bought in 2024, surgery in 2025. MRI showed 10-year degenerative changes. Pre-existing condition.',
        lesson: 'Degenerative conditions are detectable. Wait 4 years or disclose upfront.',
    },
    {
        id: 7,
        category: 'health',
        title: 'Heart Surgery Partial - Room Rent Capping Applied',
        verdict: 'partial',
        amount: '₹2.8L of ₹6.5L',
        summary: 'Chose ₹12,000/day room, policy limit was ₹4,000. Entire bill reduced proportionally (33%).',
        lesson: 'Room rent affects EVERYTHING - surgeon fees, nursing, all proportionally cut.',
    },
    {
        id: 8,
        category: 'health',
        title: 'Dialysis Rejected - Within Waiting Period',
        verdict: 'rejected',
        amount: '₹2 Lakhs',
        summary: 'Kidney failure 18 months after policy. Renal conditions have 24-48 month waiting period.',
        lesson: 'Know specific disease waiting periods. Kidney, cancer, heart = longer waits.',
    },
    {
        id: 9,
        category: 'health',
        title: 'Maternity Claim Rejected - Bought During Pregnancy',
        verdict: 'rejected',
        amount: '₹1.2 Lakhs',
        summary: 'Policy bought in 3rd month of pregnancy. C-section in 7th month. Maternity has 9-month to 3-year wait.',
        lesson: 'Buy health insurance BEFORE planning pregnancy. Minimum 9 months wait.',
    },
    {
        id: 10,
        category: 'health',
        title: 'Dental Surgery Rejected - Not Accident Related',
        verdict: 'rejected',
        amount: '₹80,000',
        summary: 'Root canal and implants claimed. Denied as dental is excluded unless accident-related.',
        lesson: 'Dental coverage needs specific add-on. Standard health excludes dental.',
    },
    {
        id: 11,
        category: 'health',
        title: 'Cataract Surgery Partial - Sub-limit Applied',
        verdict: 'partial',
        amount: '₹25K of ₹75K',
        summary: '₹5L policy but cataract sub-limit of ₹25K per eye. Premium lens and advanced procedure not covered.',
        lesson: 'Check disease-wise sub-limits. Cataract, hernia, piles often capped.',
    },
    {
        id: 12,
        category: 'health',
        title: 'COVID Home Treatment Rejected',
        verdict: 'rejected',
        amount: '₹1.5 Lakhs',
        summary: 'Treated at home with oxygen concentrator. Hospital beds were available. Domiciliary needs unavailability proof.',
        lesson: 'Home treatment covered ONLY if hospitalization is medically impossible.',
    },
    {
        id: 13,
        category: 'health',
        title: 'Physiotherapy Rejected - OPD Excluded',
        verdict: 'rejected',
        amount: '₹60,000',
        summary: '6 months of post-surgery physiotherapy claimed. OPD treatments not covered in standard policy.',
        lesson: 'Buy OPD add-on if you expect regular non-hospitalization treatments.',
    },

    // === MOTOR INSURANCE REJECTIONS ===
    {
        id: 14,
        category: 'motor',
        title: 'Total Loss Claim Rejected - Drunk Driving',
        verdict: 'rejected',
        amount: '₹12 Lakhs',
        summary: 'Luxury car total loss. Police report showed 120mg/100ml blood alcohol (limit: 30). Zero payout.',
        lesson: 'Drunk driving = automatic rejection. No exceptions ever.',
    },
    {
        id: 15,
        category: 'motor',
        title: 'Engine Damage Rejected - Started in Flood',
        verdict: 'rejected',
        amount: '₹3.5 Lakhs',
        summary: 'Car stalled in waterlogged road. Owner tried starting multiple times. Hydrostatic lock damage.',
        lesson: 'NEVER start car in water. Buy Engine Protect add-on. Wait for tow truck.',
    },
    {
        id: 16,
        category: 'motor',
        title: 'Claim Rejected - Son Had Learner License',
        verdict: 'rejected',
        amount: '₹8 Lakhs',
        summary: '18-year-old son crashed father\'s car. Had learner license, driving alone without L-board.',
        lesson: 'Learner must have licensed driver alongside. Invalid license = no claim.',
    },
    {
        id: 17,
        category: 'motor',
        title: 'Theft Claim Reduced - Low IDV Selected',
        verdict: 'partial',
        amount: '₹4L of ₹7L market value',
        summary: 'Chose minimum IDV (₹4L) to save premium. Car worth ₹7L stolen. Maximum payout was IDV.',
        lesson: 'IDV is your maximum payout. Don\'t underinsure to save ₹2000 premium.',
    },
    {
        id: 18,
        category: 'motor',
        title: 'Commercial Use Rejection - Ola Driver',
        verdict: 'rejected',
        amount: '₹5 Lakhs',
        summary: 'Private car insurance. Accident while doing Ola ride. Commercial use voids private policy.',
        lesson: 'Ola/Uber drivers MUST have commercial vehicle insurance, not private.',
    },
    {
        id: 19,
        category: 'motor',
        title: 'Claim Reduced - Depreciation Applied',
        verdict: 'partial',
        amount: '₹1.2L of ₹2L',
        summary: 'Bumper, headlights, tyres replaced. 50% depreciation on rubber/plastic. Only metal at full value.',
        lesson: 'Buy Zero Depreciation add-on. Standard policy has heavy depreciation cuts.',
    },
    {
        id: 20,
        category: 'motor',
        title: 'CNG Kit Fire Rejected - Not Declared',
        verdict: 'rejected',
        amount: '₹2.5 Lakhs',
        summary: 'Aftermarket CNG kit caught fire. Kit not endorsed in insurance. Entire fire damage rejected.',
        lesson: 'All modifications must be declared and endorsed. CNG needs separate cover.',
    },

    // === TRAVEL INSURANCE REJECTIONS ===
    {
        id: 21,
        category: 'travel',
        title: 'Medical Emergency Rejected - Pre-existing Heart',
        verdict: 'rejected',
        amount: '$45,000 (₹37 Lakhs)',
        summary: 'Heart attack in USA. History of hypertension and cholesterol. Pre-existing exclusion applied.',
        lesson: 'Declare all conditions. Some insurers offer pre-existing cover for extra premium.',
    },
    {
        id: 22,
        category: 'travel',
        title: 'Skiing Injury Rejected - Adventure Exclusion',
        verdict: 'rejected',
        amount: '€25,000 (₹22 Lakhs)',
        summary: 'Broken leg while skiing in Switzerland. Standard policy excludes adventure sports.',
        lesson: 'Buy Adventure Sports add-on before skiing, scuba, paragliding, etc.',
    },
    {
        id: 23,
        category: 'travel',
        title: 'Baggage Claim Partial - Sub-limit Per Item',
        verdict: 'partial',
        amount: '$500 of $3000',
        summary: 'Lost bag had ₹2.5L camera. Per-item limit was $500. Only received fraction of value.',
        lesson: 'Expensive items need separate valuable items cover. Check per-item limits.',
    },
    {
        id: 24,
        category: 'travel',
        title: 'Trip Cancellation Rejected - Work Reason',
        verdict: 'rejected',
        amount: '₹1.8 Lakhs',
        summary: 'Boss called urgent meeting, had to cancel Europe trip. Work reasons not covered.',
        lesson: 'Only illness, death, serious emergencies covered. Read cancellation terms.',
    },

    // === HOME INSURANCE REJECTIONS ===
    {
        id: 25,
        category: 'home',
        title: 'Flood Damage Rejected - No Add-on',
        verdict: 'rejected',
        amount: '₹8 Lakhs',
        summary: 'Ground floor flooded in Mumbai rains. Standard fire policy doesn\'t cover flood.',
        lesson: 'Flood, earthquake, terrorism need separate add-ons in India.',
    },
    {
        id: 26,
        category: 'home',
        title: 'Theft Rejected - No Forced Entry',
        verdict: 'rejected',
        amount: '₹3.5 Lakhs',
        summary: 'Servant stole jewelry. No signs of break-in. Policy requires forcible entry proof.',
        lesson: 'Theft without forced entry requires fidelity/domestic help cover.',
    },
    {
        id: 27,
        category: 'home',
        title: 'Gold Theft Partial - Sub-limit Applied',
        verdict: 'partial',
        amount: '₹1L of ₹5L stolen',
        summary: 'Burglary with ₹5L gold stolen. Jewelry sub-limit was ₹1L in home contents policy.',
        lesson: 'Declare valuables separately. Gold/jewelry have very low default limits.',
    },
    {
        id: 28,
        category: 'home',
        title: 'Water Damage Rejected - Gradual Leak',
        verdict: 'rejected',
        amount: '₹2 Lakhs',
        summary: 'Bathroom leak damaged bedroom over months. Gradual seepage not covered, only sudden.',
        lesson: 'Maintain home regularly. Only sudden/accidental damage covered.',
    },

    // === APPROVED CASES (for balance) ===
    {
        id: 29,
        category: 'health',
        title: 'Bypass Surgery Approved - After Waiting Period',
        verdict: 'approved',
        amount: '₹12 Lakhs',
        summary: 'Heart bypass in year 5 of policy. No pre-existing heart issues. Smooth cashless claim.',
        lesson: 'Long-term policies with clean history = smooth claims.',
    },
    {
        id: 30,
        category: 'motor',
        title: 'Total Loss Approved - Proper Process',
        verdict: 'approved',
        amount: '₹9.5 Lakhs',
        summary: 'Car totaled in highway accident. FIR filed, surveyor visit, all documents submitted. Paid IDV.',
        lesson: 'Choose realistic IDV, file FIR immediately, follow insurer process.',
    },
]

const verdictStyles = {
    approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    partial: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
}

export default function ClaimCasesPage() {
    return (
        <div className="min-h-screen pt-20">
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 glass border-primary-500/30 
                         text-primary-500 text-sm rounded-full mb-4 font-medium">
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
                        <Card key={caseItem.id} hover className={`border-l-4 ${verdictStyles[caseItem.verdict]}`}>
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div>
                                    <span className="inline-block px-2 py-1 glass text-theme-secondary text-xs rounded-lg mb-2 uppercase">
                                        {caseItem.category}
                                    </span>
                                    <h3 className="font-display font-semibold text-lg text-theme-primary">{caseItem.title}</h3>
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${verdictStyles[caseItem.verdict]}`}>
                                    {caseItem.verdict === 'approved' && <><CheckCircle className="w-4 h-4" /> Approved</>}
                                    {caseItem.verdict === 'rejected' && <><XCircle className="w-4 h-4" /> Rejected</>}
                                    {caseItem.verdict === 'partial' && <><AlertTriangle className="w-4 h-4" /> Partial</>}
                                </div>
                            </div>

                            <p className="text-theme-secondary mb-4">{caseItem.summary}</p>

                            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-primary-500/10">
                                <div>
                                    <span className="text-theme-muted text-sm">Claim Amount: </span>
                                    <span className="text-theme-primary font-medium">{caseItem.amount}</span>
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

