import {
    Database, Heart, Building2, Car, Home, Plane, Gem, UserCheck,
    Search, Scale, Calculator, FileText, ClipboardList, Briefcase, Network, Ship, Zap, Quote,
    Activity, HeartPulse, UserCircle, Users, UserX, Baby, Bot, BookOpen, Library, Info
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tone, Surface } from '@/lib/theme/tone'

type NavItem = {
    href: string
    label: string
    description: string
    icon: LucideIcon
    tone: Tone
    surface: Surface
}

export const insuranceTypes: NavItem[] = [
    { href: '/insurance/life', label: 'Life Insurance', description: 'Financial protection for your family', icon: Heart, tone: 'brand', surface: 'gradient' },
    { href: '/insurance/term-life', label: 'Term Life Insurance', description: 'Pure life cover at affordable rates', icon: HeartPulse, tone: 'brand', surface: 'gradient' },
    { href: '/insurance/health', label: 'Health Insurance', description: 'Coverage for medical expenses', icon: Building2, tone: 'success', surface: 'gradient' },
    { href: '/insurance/family-floater', label: 'Family Floater', description: 'One health plan for the whole family', icon: Users, tone: 'brand', surface: 'gradient' },
    { href: '/insurance/senior-citizen', label: 'Senior Citizen', description: 'Specialized health cover for elders', icon: UserCircle, tone: 'success', surface: 'gradient' },
    { href: '/insurance/critical-illness', label: 'Critical Illness', description: 'Lump-sum payout for major illnesses', icon: Activity, tone: 'danger', surface: 'gradient' },
    { href: '/insurance/maternity', label: 'Maternity Insurance', description: 'Coverage for pregnancy and childbirth', icon: Baby, tone: 'danger', surface: 'gradient' },
    { href: '/insurance/motor', label: 'Motor Insurance', description: 'Comprehensive cover for your vehicles', icon: Car, tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/home', label: 'Home Insurance', description: 'Protect your property and belongings', icon: Home, tone: 'warning', surface: 'gradient' },
    { href: '/insurance/travel', label: 'Travel Insurance', description: 'Secure your domestic & international trips', icon: Plane, tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/disability', label: 'Disability Insurance', description: 'Income replacement for disabilities', icon: UserX, tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/specialized', label: 'Specialized Individual', description: 'Custom plans for unique needs', icon: Gem, tone: 'brand', surface: 'gradient' },
    { href: '/insurance/personal-accident', label: 'Personal Accident', description: 'Accidental injury and death cover', icon: UserCheck, tone: 'danger', surface: 'gradient' },
]

export const businessTypes: NavItem[] = [
    { href: '/insurance/business', label: 'Commercial Package', description: 'All-in-one business protection', icon: Briefcase, tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/cyber', label: 'Cyber Security Cover', description: 'Protection against digital threats', icon: Network, tone: 'info', surface: 'gradient' },
    { href: '/insurance/liability', label: 'Liability Insurance', description: 'Cover for legal liabilities', icon: Scale, tone: 'warning', surface: 'gradient' },
    { href: '/insurance/marine', label: 'Marine & Aviation', description: 'Transit and aviation risk cover', icon: Ship, tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/ev', label: 'EV & Emerging Tech', description: 'Insurance for modern technologies', icon: Zap, tone: 'brand', surface: 'gradient' },
    { href: '/insurance/directory', label: 'Insurance Directory', description: 'Browse all business policies', icon: Database, tone: 'brand', surface: 'gradient' },
]

export const tools: NavItem[] = [
    { href: '/tools/ai-advisor', label: 'AI Risk Advisor', description: 'Get personalized insurance advice', icon: Bot, tone: 'brand', surface: 'gradient' },
    { href: '/tools/interactive-quote', label: 'Interactive Quote', description: 'Calculate precise premiums instantly', icon: Quote, tone: 'neutral', surface: 'gradient' },
    { href: '/track', label: 'Track Application', description: 'Monitor your policy status', icon: ClipboardList, tone: 'info', surface: 'gradient' },
    { href: '/tools/hidden-facts', label: 'Hidden Facts Revealer', description: 'Uncover hidden clauses in policies', icon: Search, tone: 'danger', surface: 'gradient' },
    { href: '/tools/compare', label: 'Policy Comparison', description: 'Compare multiple plans side-by-side', icon: Scale, tone: 'neutral', surface: 'gradient' },
    { href: '/tools/calculator', label: 'Premium Calculator', description: 'Estimate costs for your coverage', icon: Calculator, tone: 'success', surface: 'gradient' },
    { href: '/tools/claim-cases', label: 'Claim Cases', description: 'Read real-world claim experiences', icon: FileText, tone: 'warning', surface: 'gradient' },
]

export const knowledgeCenter: NavItem[] = [
    { href: '/hubs', label: 'Knowledge Hubs', description: 'Deep-dive insurance guides', icon: Library, tone: 'brand', surface: 'gradient' },
    { href: '/resources', label: 'Resources', description: 'Helpful articles and FAQs', icon: BookOpen, tone: 'neutral', surface: 'gradient' },
    { href: '/about', label: 'About Us', description: 'Learn about InsuranceClarity', icon: Info, tone: 'brand', surface: 'gradient' },
]
