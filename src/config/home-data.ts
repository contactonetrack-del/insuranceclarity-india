import {
    Heart, HeartPulse, Building2, Users, UserCircle, Activity, Baby, Car, Home, Plane, UserX, Gem, UserCheck,
    Briefcase, Network, Scale, Ship, Zap, Database, Search, Calculator, Bot, FileText, Shield, BarChart3
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tone, Surface } from '@/lib/theme/tone'

type MarketingCategory = {
    href: string
    icon: LucideIcon
    title: string
    desc: string
    tone: Tone
    surface: Surface
}

type MarketingTool = {
    href: string
    icon: LucideIcon
    title: string
    desc: string
    badge: string
    stat: string
    statLabel: string
    tone: Tone
    surface: Surface
}

export const insuranceCategories: MarketingCategory[] = [
    { href: '/insurance/life', icon: Heart, title: 'Life Insurance', desc: 'Term, Whole Life, ULIPs', tone: 'brand', surface: 'gradient' },
    { href: '/insurance/term-life', icon: HeartPulse, title: 'Term Life', desc: 'Pure Protection, High Cover', tone: 'brand', surface: 'gradient' },
    { href: '/insurance/health', icon: Building2, title: 'Health Insurance', desc: 'Individual, Family, Critical Illness', tone: 'success', surface: 'gradient' },
    { href: '/insurance/family-floater', icon: Users, title: 'Family Floater', desc: 'One Policy, Entire Family', tone: 'brand', surface: 'gradient' },
    { href: '/insurance/senior-citizen', icon: UserCircle, title: 'Senior Citizen', desc: 'Care for your Parents', tone: 'success', surface: 'gradient' },
    { href: '/insurance/critical-illness', icon: Activity, title: 'Critical Illness', desc: 'Life-Changing Illness Cover', tone: 'danger', surface: 'gradient' },
    { href: '/insurance/maternity', icon: Baby, title: 'Maternity Insurance', desc: 'Welcoming New Life Safely', tone: 'danger', surface: 'gradient' },
    { href: '/insurance/motor', icon: Car, title: 'Motor Insurance', desc: 'Car, Bike, Comprehensive', tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/home', icon: Home, title: 'Home Insurance', desc: 'Building, Contents, Fire', tone: 'warning', surface: 'gradient' },
    { href: '/insurance/travel', icon: Plane, title: 'Travel Insurance', desc: 'Domestic, International', tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/disability', icon: UserX, title: 'Disability Cover', desc: 'Income Protection for Injuries', tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/specialized', icon: Gem, title: 'Specialized', desc: 'Pet, Wedding, Gadget', tone: 'brand', surface: 'gradient' },
    { href: '/insurance/personal-accident', icon: UserCheck, title: 'Personal Accident', desc: 'Disability, Death, Medical', tone: 'danger', surface: 'gradient' },
]

export const businessCategories: MarketingCategory[] = [
    { href: '/insurance/business', icon: Briefcase, title: 'Commercial Package', desc: 'SME, Corporate Property, Interruption', tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/cyber', icon: Network, title: 'Cyber Security Cover', desc: 'Data Breach, Ransomware, Liability', tone: 'info', surface: 'gradient' },
    { href: '/insurance/liability', icon: Scale, title: 'Liability Insurance', desc: 'Public, Product, D&O, Professional', tone: 'warning', surface: 'gradient' },
    { href: '/insurance/marine', icon: Ship, title: 'Marine & Aviation', desc: 'Cargo, Hull, Freight Liability', tone: 'neutral', surface: 'gradient' },
    { href: '/insurance/ev', icon: Zap, title: 'EV & Emerging Tech', desc: 'Electric Vehicles, AI, Parametric', tone: 'brand', surface: 'gradient' },
    { href: '/insurance/directory', icon: Database, title: 'Insurance Directory', desc: 'Verified Directory of Indian Insurers', tone: 'brand', surface: 'gradient' },
]

export const tools: MarketingTool[] = [
    {
        href: '/tools/ai-scanner',
        icon: Bot,
        title: 'Policy AI Auditor',
        desc: 'Upload any policy PDF. Our AI scans thousands of words to detect "Hidden Exclusions" and Red Flags.',
        badge: 'AI Powered',
        stat: 'Audit',
        statLabel: 'Instant Scan',
        tone: 'danger',
        surface: 'gradient',
    },
    {
        href: '/tools/hlv-calculator',
        icon: Calculator,
        title: 'HLV Calculator',
        desc: 'Calculate exactly how much Life Cover you need based on income, liabilities, and inflation.',
        badge: 'Free',
        stat: 'Smart',
        statLabel: 'HLV Result',
        tone: 'success',
        surface: 'gradient',
    },
    {
        href: '/tools/claim-search',
        icon: Search,
        title: 'Claim Case Search',
        desc: 'Search real-life insurance claim cases. Learn what got approved, rejected, and why.',
        badge: 'New',
        stat: '30+',
        statLabel: 'Case Laws',
        tone: 'info',
        surface: 'gradient',
    },
    {
        href: '/tools/room-rent',
        icon: Home,
        title: 'Room Rent Mapper',
        desc: 'Impact of Room Rent Capping on your surgical claims. Visualize your potential out-of-pocket loss.',
        badge: 'Critical',
        stat: 'Mapper',
        statLabel: 'Loss Check',
        tone: 'warning',
        surface: 'gradient',
    },
    {
        href: '/tools/tax-benefit',
        icon: Zap,
        title: 'Tax Benefit Check',
        desc: 'Compare Old vs New Tax Regimes. See how insurance premiums (80C/80D) save you money.',
        badge: 'FY 24-25',
        stat: 'Compare',
        statLabel: 'Tax Logic',
        tone: 'brand',
        surface: 'gradient',
    },
    {
        href: '/tools/hidden-facts',
        icon: FileText,
        title: 'Hidden Facts',
        desc: '150+ expert-curated facts about insurance traps that companies don\'t want you to know.',
        badge: 'Expert',
        stat: '150+',
        statLabel: 'Exposed',
        tone: 'neutral',
        surface: 'gradient',
    }
]

export const stats = [
    { value: 150, label: 'Hidden Facts', icon: Search, suffix: '+' },
    { value: 13, label: 'Insurance Types', icon: Shield, suffix: '' },
    { value: 6, label: 'Free Tools', icon: BarChart3, suffix: '' },
    { value: 30, label: 'Claim Cases', icon: FileText, suffix: '+' },
]

export const partnerLogos = [
    { name: "LIC", url: "/Logos/life-insurance-corporation-logo-png_seeklogo-477287.png", w: 160, h: 60 },
    { name: "HDFC Life", url: "/Logos/HDFC-Life-Logo.png", w: 120, h: 40 },
    { name: "Aditya Birla", url: "/Logos/Aditya Birla Insurace.png", w: 160, h: 60 },
    { name: "ICICI Prudential", url: "/Logos/icici-prudential-life-insurance-logo-png_seeklogo-307031.png", w: 160, h: 60 },
    { name: "SBI Life", url: "/Logos/sbi-life-insurance-logo-png_seeklogo-123116.png", w: 160, h: 60 },
    { name: "Kotak Life", url: "/Logos/kotak-life-insurance-logo-png_seeklogo-212711.png", w: 160, h: 60 },
    { name: "Tata AIA", url: "/Logos/tata-aia-life-insurance-seeklogo.png", w: 160, h: 60 },
    { name: "Bajaj Allianz", url: "/Logos/bajaj-allianz-life-insurance-logo-png_seeklogo-307030.png", w: 160, h: 60 },
    { name: "Max Life", url: "/Logos/axis-max-life-insurance-logo-png_seeklogo-643158.png", w: 160, h: 60 },
    { name: "Star Health", url: "/Logos/star-health-insurance-logo-png_seeklogo-303863.png", w: 160, h: 60 },
    { name: "Care Health", url: "/Logos/Care_health_insurance_logo.png", w: 160, h: 60 },
    { name: "Digit Insurance", url: "/Logos/digit-insurance-logo-png_seeklogo-465810.png", w: 160, h: 60 },
    { name: "Acko", url: "/Logos/Acko_General_Insurance_logo.svg.png", w: 160, h: 60 },
    { name: "IndusInd Nippon Life", url: "/Logos/Reliance_Life_Insurance_Logo.png", w: 160, h: 60 },
    { name: "Reliance General", url: "/Logos/reliance-general-insurance-logo-png_seeklogo-503447.png", w: 160, h: 60 },
    { name: "IndiaFirst Life", url: "/Logos/ifli-logo-new.png", w: 160, h: 60 },
    { name: "HDFC Ergo", url: "/Logos/HDFC-Ergo-Logo.png", w: 160, h: 60 },
    { name: "Nippon Life India", url: "/Logos/nippon-life-insurance-logo-png_seeklogo-99705.png", w: 120, h: 40 },
    { name: "Ageas Federal", url: "/Logos/AgeasFederal-_Logo_Color.png", w: 160, h: 60 },
    { name: "Bharti AXA", url: "/Logos/BhartiAXALifeInsurance.png", w: 160, h: 60 },
    { name: "Generali Central", url: "/Logos/Future Generali insurance.png", w: 160, h: 60 },
    { name: "IFFCO Tokio", url: "/Logos/IFFCO_TOKIO_Logo.png", w: 160, h: 60 },
    { name: "National Insurance", url: "/Logos/National_Insurance_Company.png", w: 160, h: 60 },
    { name: "Oriental Insurance", url: "/Logos/The_Oriental_Insurance_Company_Logo.png", w: 160, h: 60 },
    { name: "United India", url: "/Logos/United_India_Insurance.png", w: 120, h: 40 },
    { name: "Aviva", url: "/Logos/avivi.png", w: 160, h: 60 },
    { name: "Edelweiss", url: "/Logos/edelweisslogo.png", w: 160, h: 60 },
    { name: "Manipal Cigna", url: "/Logos/hi-logo-Manipal.png", w: 200, h: 60 },
    { name: "MetLife", url: "/Logos/met-life-india-logo-png_seeklogo-91366.png", w: 160, h: 60 },
    { name: "Star Union Dai-ichi", url: "/Logos/Star unini dai.png", w: 160, h: 60 },
    { name: "Niva Bupa", url: "/Logos/bupa Insurance.png", w: 160, h: 60 },
    { name: "ICICI Lombard", url: "/Logos/ICICI-Lombard.png", w: 160, h: 60 },
    { name: "New India Assurance", url: "/Logos/New India Assurance.png", w: 160, h: 60 },
    { name: "Cholamandalam MS", url: "/Logos/Cholamandalam MS.png", w: 160, h: 60 },
    { name: "Kotak General", url: "/Logos/Kotak General Insurance.png", w: 160, h: 60 },
]
