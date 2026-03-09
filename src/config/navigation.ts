import {
    Database, Heart, Building2, Car, Home, Plane, Gem, UserCheck,
    Search, Scale, Calculator, FileText, ClipboardList, Briefcase, Network, Ship, Zap, Quote,
    Activity, HeartPulse, UserCircle, Users, UserX, Baby, Bot
} from 'lucide-react'

export const insuranceTypes = [
    { href: '/insurance/life', label: 'Life Insurance', icon: Heart, color: 'from-red-500 to-pink-600' },
    { href: '/insurance/term-life', label: 'Term Life Insurance', icon: HeartPulse, color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/health', label: 'Health Insurance', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { href: '/insurance/family-floater', label: 'Family Floater', icon: Users, color: 'from-fuchsia-500 to-pink-600' },
    { href: '/insurance/senior-citizen', label: 'Senior Citizen', icon: UserCircle, color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/critical-illness', label: 'Critical Illness', icon: Activity, color: 'from-rose-500 to-red-600' },
    { href: '/insurance/maternity', label: 'Maternity Insurance', icon: Baby, color: 'from-pink-500 to-rose-600' },
    { href: '/insurance/motor', label: 'Motor Insurance', icon: Car, color: 'from-blue-500 to-indigo-600' },
    { href: '/insurance/home', label: 'Home Insurance', icon: Home, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/travel', label: 'Travel Insurance', icon: Plane, color: 'from-purple-500 to-violet-600' },
    { href: '/insurance/disability', label: 'Disability Insurance', icon: UserX, color: 'from-indigo-500 to-purple-600' },
    { href: '/insurance/specialized', label: 'Specialized Individual', icon: Gem, color: 'from-cyan-500 to-blue-600' },
    { href: '/insurance/personal-accident', label: 'Personal Accident', icon: UserCheck, color: 'from-rose-500 to-red-600' },
]

export const businessTypes = [
    { href: '/insurance/business', label: 'Commercial Package', icon: Briefcase, color: 'from-slate-600 to-gray-800' },
    { href: '/insurance/cyber', label: 'Cyber Security Cover', icon: Network, color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/liability', label: 'Liability Insurance', icon: Scale, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/marine', label: 'Marine & Aviation', icon: Ship, color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/ev', label: 'EV & Emerging Tech', icon: Zap, color: 'from-fuchsia-500 to-purple-600' },
    { href: '/insurance/directory', label: 'Insurance Directory', icon: Database, color: 'from-accent to-accent-hover' },
]

export const tools = [
    { href: '/tools/ai-advisor', label: 'AI Risk Advisor', icon: Bot, color: 'from-indigo-500 to-purple-600' },
    { href: '/tools/interactive-quote', label: 'Interactive Quote', icon: Quote, color: 'from-blue-500 to-indigo-600' },
    { href: '/track', label: 'Track Application', icon: ClipboardList, color: 'from-teal-600 to-emerald-700' },
    { href: '/tools/hidden-facts', label: 'Hidden Facts Revealer', icon: Search, color: 'from-red-500 to-rose-600' },
    { href: '/tools/compare', label: 'Policy Comparison', icon: Scale, color: 'from-blue-500 to-indigo-600' },
    { href: '/tools/calculator', label: 'Premium Calculator', icon: Calculator, color: 'from-green-600 to-green-800' },
    { href: '/tools/claim-cases', label: 'Claim Cases', icon: FileText, color: 'from-amber-500 to-yellow-600' },
]
