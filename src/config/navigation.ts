import {
    Database, Heart, Building2, Car, Home, Plane, Gem, UserCheck,
    Search, Scale, Calculator, FileText, ClipboardList, Briefcase, Network, Ship, Zap, Quote,
    Activity, HeartPulse, UserCircle, Users, UserX, Baby, Bot, BookOpen, Library, Info
} from 'lucide-react'

export const insuranceTypes = [
    { href: '/insurance/life', label: 'Life Insurance', description: 'Financial protection for your family', icon: Heart, color: 'from-red-500 to-pink-600' },
    { href: '/insurance/term-life', label: 'Term Life Insurance', description: 'Pure life cover at affordable rates', icon: HeartPulse, color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/health', label: 'Health Insurance', description: 'Coverage for medical expenses', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { href: '/insurance/family-floater', label: 'Family Floater', description: 'One health plan for the whole family', icon: Users, color: 'from-fuchsia-500 to-pink-600' },
    { href: '/insurance/senior-citizen', label: 'Senior Citizen', description: 'Specialized health cover for elders', icon: UserCircle, color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/critical-illness', label: 'Critical Illness', description: 'Lump-sum payout for major illnesses', icon: Activity, color: 'from-rose-500 to-red-600' },
    { href: '/insurance/maternity', label: 'Maternity Insurance', description: 'Coverage for pregnancy and childbirth', icon: Baby, color: 'from-pink-500 to-rose-600' },
    { href: '/insurance/motor', label: 'Motor Insurance', description: 'Comprehensive cover for your vehicles', icon: Car, color: 'from-blue-500 to-indigo-600' },
    { href: '/insurance/home', label: 'Home Insurance', description: 'Protect your property and belongings', icon: Home, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/travel', label: 'Travel Insurance', description: 'Secure your domestic & international trips', icon: Plane, color: 'from-purple-500 to-violet-600' },
    { href: '/insurance/disability', label: 'Disability Insurance', description: 'Income replacement for disabilities', icon: UserX, color: 'from-indigo-500 to-purple-600' },
    { href: '/insurance/specialized', label: 'Specialized Individual', description: 'Custom plans for unique needs', icon: Gem, color: 'from-cyan-500 to-blue-600' },
    { href: '/insurance/personal-accident', label: 'Personal Accident', description: 'Accidental injury and death cover', icon: UserCheck, color: 'from-rose-500 to-red-600' },
]

export const businessTypes = [
    { href: '/insurance/business', label: 'Commercial Package', description: 'All-in-one business protection', icon: Briefcase, color: 'from-slate-600 to-gray-800' },
    { href: '/insurance/cyber', label: 'Cyber Security Cover', description: 'Protection against digital threats', icon: Network, color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/liability', label: 'Liability Insurance', description: 'Cover for legal liabilities', icon: Scale, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/marine', label: 'Marine & Aviation', description: 'Transit and aviation risk cover', icon: Ship, color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/ev', label: 'EV & Emerging Tech', description: 'Insurance for modern technologies', icon: Zap, color: 'from-fuchsia-500 to-purple-600' },
    { href: '/insurance/directory', label: 'Insurance Directory', description: 'Browse all business policies', icon: Database, color: 'from-accent to-accent-hover' },
]

export const tools = [
    { href: '/tools/ai-advisor', label: 'AI Risk Advisor', description: 'Get personalized insurance advice', icon: Bot, color: 'from-indigo-500 to-purple-600' },
    { href: '/tools/interactive-quote', label: 'Interactive Quote', description: 'Calculate precise premiums instantly', icon: Quote, color: 'from-blue-500 to-indigo-600' },
    { href: '/track', label: 'Track Application', description: 'Monitor your policy status', icon: ClipboardList, color: 'from-teal-600 to-emerald-700' },
    { href: '/tools/hidden-facts', label: 'Hidden Facts Revealer', description: 'Uncover hidden clauses in policies', icon: Search, color: 'from-red-500 to-rose-600' },
    { href: '/tools/compare', label: 'Policy Comparison', description: 'Compare multiple plans side-by-side', icon: Scale, color: 'from-blue-500 to-indigo-600' },
    { href: '/tools/calculator', label: 'Premium Calculator', description: 'Estimate costs for your coverage', icon: Calculator, color: 'from-green-600 to-green-800' },
    { href: '/tools/claim-cases', label: 'Claim Cases', description: 'Read real-world claim experiences', icon: FileText, color: 'from-amber-500 to-yellow-600' },
]

export const knowledgeCenter = [
    { href: '/hubs', label: 'Knowledge Hubs', description: 'Deep-dive insurance guides', icon: Library, color: 'from-fuchsia-500 to-purple-600' },
    { href: '/resources', label: 'Resources', description: 'Helpful articles and FAQs', icon: BookOpen, color: 'from-teal-500 to-emerald-600' },
    { href: '/about', label: 'About Us', description: 'Learn about InsuranceClarity', icon: Info, color: 'from-blue-500 to-indigo-600' },
]
