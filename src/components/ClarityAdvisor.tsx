'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    X,
    ArrowRight,
    Shield,
    Calculator,
    Heart,
    Info,
    Coffee,
    Send,
    Bot,
    User,
    Sparkles,
    Navigation,
    BookOpen,
    Trash2,
    Zap,
    Home,
    Plane,
    Gem,
    AlertCircle,
    FileText,
    Scale
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Message {
    id: string
    type: 'bot' | 'user'
    text: string
    actions?: { label: string; href: string; icon: any }[]
}

// ─── Intent Definitions ────────────────────────────────────────────────────
// Each intent: keywords, a rich response, and contextual action buttons.
// Keywords are matched as substrings so partial words like "insur" hit "insurance".

const INTENTS = [
    // ── Greetings ──────────────────────────────────────────────────────────
    {
        keywords: ['hi', 'hello', 'hey', 'greet', 'morning', 'evening', 'good day', 'yo', 'namaste', 'hola'],
        response: "Hello! 👋 I'm your Clarity Advisor — India's smartest insurance guide. Tell me what you need:\n• What type of insurance are you looking for?\n• Do you want to compare policies?\n• Need help understanding a claim?\n\nJust type naturally and I'll help!",
        actions: [
            { label: 'Calculate Premium', href: '/tools/calculator', icon: Calculator },
            { label: 'Expert Guides', href: '/resources', icon: BookOpen },
        ]
    },

    // ── About the bot ──────────────────────────────────────────────────────
    {
        keywords: ['who are you', 'what are you', 'what can you do', 'your name', 'about you', 'help me', 'what do you', 'purpose', 'bot', 'advisor', 'clarity advisor'],
        response: "I'm the **Clarity Advisor** — built specifically for InsuranceClarity India. I can:\n\n🔍 Explain any insurance type (Life, Health, Motor, Home, Travel…)\n📊 Help you estimate premiums\n📋 Guide you through claim processes\n⚠️ Reveal hidden policy exclusions\n🔗 Direct you to the right tools & guides\n\nWhat would you like help with today?",
        actions: [
            { label: 'Hidden Facts Tool', href: '/tools/hidden-facts', icon: AlertCircle },
            { label: 'Compare Policies', href: '/tools/compare', icon: Scale },
        ]
    },

    // ── What type of insurance ──────────────────────────────────────────────
    {
        keywords: ['what type', 'which type', 'type of insur', 'what insur', 'which insur', 'what kind', 'which kind', 'types of', 'kinds of', 'insurance options', 'different insur', 'categories'],
        response: "Great question! Here are the main insurance categories:\n\n🔴 **Life & Health**: Term Life, Whole Life, Health, Family Floater, Senior Citizen, Critical Illness, Maternity\n🚗 **Motor**: Car, Two-Wheeler, Commercial Vehicle\n🏠 **Property**: Home, Fire, Contents\n✈️ **Travel**: Domestic, International\n💎 **Specialized**: Disability, Personal Accident, Pet, Gadget\n🏢 **Business**: Commercial, Cyber, Liability, Marine\n\nWhich category interests you most?",
        actions: [
            { label: 'Life Insurance', href: '/insurance/life', icon: Heart },
            { label: 'Health Insurance', href: '/insurance/health', icon: Shield },
            { label: 'Motor Insurance', href: '/insurance/motor', icon: Navigation },
            { label: 'All Types', href: '/', icon: BookOpen },
        ]
    },

    // ── Term Life ──────────────────────────────────────────────────────────
    {
        keywords: ['term life', 'term plan', 'term policy', 'term insur', 'pure protection', 'death benefit', 'sum assured', 'nominee'],
        response: "**Term Life Insurance** is the most cost-effective form of life cover. Here's what you should know:\n\n✅ Pays a lump sum to your family if you pass away during the policy term\n✅ No maturity benefit (pure risk cover = cheap premiums)\n✅ Coverage of ₹1–5 Cr available for ₹700–₹1,200/month\n⚠️ Hidden Fact: Most term plans exclude suicide within the first year, death due to adventure sports, and drug/alcohol-related deaths\n\n💡 *Ideal for: Anyone with dependents or loans*",
        actions: [
            { label: 'Term Insurance Guide', href: '/insurance/term-life', icon: Shield },
            { label: 'Calculate Premium', href: '/tools/calculator', icon: Calculator },
            { label: 'Hidden Exclusions', href: '/tools/hidden-facts', icon: AlertCircle },
        ]
    },

    // ── Life Insurance (general) ───────────────────────────────────────────
    {
        keywords: ['life insur', 'whole life', 'endowment', 'ulip', 'money back', 'lic', 'life cover', 'life plan'],
        response: "**Life Insurance** comes in several forms:\n\n📋 **Term Plan** — Pure protection, high cover, low cost (₹700–₹1,200/month for ₹1 Cr)\n📋 **Whole Life** — Cover till age 99/100, builds cash value\n📋 **ULIP** — Insurance + investment in market-linked funds\n📋 **Endowment** — Maturity payout + death benefit\n📋 **Money Back** — Periodic payouts during policy term\n\n⚠️ *ULIPs and Endowments often have high charges — read the fine print!*",
        actions: [
            { label: 'Life Insurance Page', href: '/insurance/life', icon: Heart },
            { label: 'Term vs ULIP Guide', href: '/resources', icon: BookOpen },
            { label: 'Hidden Facts', href: '/tools/hidden-facts', icon: AlertCircle },
        ]
    },

    // ── Health Insurance ───────────────────────────────────────────────────
    {
        keywords: ['health insur', 'medical insur', 'mediclaim', 'hospitaliz', 'hospital', 'doctor', 'illness', 'disease', 'surgery', 'icu', 'health plan', 'health cover', 'health policy', 'cashless'],
        response: "**Health Insurance** protects your savings from medical emergencies. Key things to check:\n\n✅ Room rent limit (Beware: sub-limits can cut your claim by 40%!)\n✅ Waiting period for pre-existing diseases (usually 2–4 years)\n✅ Network hospitals (cashless treatment)\n✅ Day-care procedures covered?\n✅ Maternity cover (usually 9–24 month waiting period)\n\n⚠️ **Common Exclusion**: Most policies don't cover dental, vision, cosmetic surgery, or obesity treatment\n\n💡 *Tip: Family floater is cheaper if everyone is young & healthy*",
        actions: [
            { label: 'Health Insurance Guide', href: '/insurance/health', icon: Shield },
            { label: 'Family Floater', href: '/insurance/family-floater', icon: Heart },
            { label: 'Critical Illness Cover', href: '/insurance/critical-illness', icon: AlertCircle },
        ]
    },

    // ── Motor / Car / Bike ─────────────────────────────────────────────────
    {
        keywords: ['car insur', 'bike insur', 'motor insur', 'vehicle insur', 'two wheeler', 'auto insur', 'third party', 'comprehensive', 'own damage', 'idv', 'no claim bonus', 'ncb', 'accident claim', 'garage', 'cashless repair'],
        response: "**Motor Insurance** is mandatory in India. Here's what matters:\n\n📋 **Third Party** (mandatory) — Covers damage to others only. Very cheap (~₹2,000/year)\n📋 **Comprehensive** — Covers your car + third party. Recommended!\n📋 **Own Damage Add-ons**: Zero depreciation, Engine Protect, Return to Invoice, Roadside Assistance\n\n⚠️ **Hidden Facts**:\n• Depreciation on parts can reduce your claim by 30–50%\n• NCB (up to 50%) is lost if you file even a small claim\n• Flood/engine damage not covered in basic plans without add-ons\n\n💡 *Always buy Zero Depreciation + Engine Protection add-ons*",
        actions: [
            { label: 'Motor Insurance Guide', href: '/insurance/motor', icon: Navigation },
            { label: 'Hidden Motor Facts', href: '/tools/hidden-facts', icon: AlertCircle },
            { label: 'Compare Policies', href: '/tools/compare', icon: Scale },
        ]
    },

    // ── Home Insurance ─────────────────────────────────────────────────────
    {
        keywords: ['home insur', 'house insur', 'property insur', 'building insur', 'flat insur', 'fire insur', 'contents insur', 'burglary', 'theft home', 'earthquake cover'],
        response: "**Home Insurance** is grossly underutilised in India but extremely valuable:\n\n✅ **Building Cover** — Covers structure against fire, earthquake, flood, lightning\n✅ **Contents Cover** — Furniture, electronics, jewellery\n✅ **All-Risk Cover** — Accidental damage to valuables\n\n⚠️ **Key Exclusions**:\n• Wear & tear is NEVER covered\n• Jewellery claims require a separate schedule/declaration\n• War, nuclear perils excluded everywhere\n\n💰 *Very affordable — ₹3,000–₹8,000/year for ₹50L cover!*",
        actions: [
            { label: 'Home Insurance Guide', href: '/insurance/home', icon: Home },
            { label: 'Hidden Exclusions', href: '/tools/hidden-facts', icon: AlertCircle },
        ]
    },

    // ── Travel Insurance ──────────────────────────────────────────────────
    {
        keywords: ['travel insur', 'trip insur', 'flight insur', 'trip cancel', 'luggage insur', 'baggage', 'lost passport', 'medical abroad', 'international travel', 'visa insur', 'schengen'],
        response: "**Travel Insurance** is essential especially for international trips:\n\n✅ Medical emergency abroad (can cost ₹10–₹50 Lakhs!)\n✅ Trip cancellation/interruption\n✅ Baggage loss or delay\n✅ Passport loss\n✅ Flight delay compensation\n\n⚠️ **Hidden Exclusions**:\n• Pre-existing conditions NOT covered (even if stable)\n• Adventure sports (trekking, diving) need special add-ons\n• Schengen visa requires minimum $30,000 medical cover\n\n💡 *Buy at least $1 Lakh medical cover for US/Europe trips*",
        actions: [
            { label: 'Travel Insurance Guide', href: '/insurance/travel', icon: Plane },
            { label: 'Get Quote Estimate', href: '/tools/calculator', icon: Calculator },
        ]
    },

    // ── Critical Illness ──────────────────────────────────────────────────
    {
        keywords: ['critical illness', 'cancer insur', 'heart attack insur', 'stroke cover', 'kidney failure', 'ci plan', 'lump sum on diagnosis', 'serious illness'],
        response: "**Critical Illness Insurance** pays a lump sum on diagnosis of serious diseases:\n\n✅ Cancer, Heart Attack, Stroke, Kidney Failure, Major Organ Transplant\n✅ Money can be used for treatment, income replacement, or anything!\n✅ Works *alongside* your health insurance\n\n⚠️ **Key Facts**:\n• Survival period clause: Must survive 30 days after diagnosis to claim\n• Waiting period: Usually 90 days from purchase\n• Pre-existing CI conditions excluded\n\n💡 *Best for high-risk individuals or family history of serious disease*",
        actions: [
            { label: 'Critical Illness Guide', href: '/insurance/critical-illness', icon: AlertCircle },
            { label: 'Compare Plans', href: '/tools/compare', icon: Scale },
        ]
    },

    // ── Senior Citizen ────────────────────────────────────────────────────
    {
        keywords: ['senior citizen', 'parent insur', 'elderly insur', 'old age insur', 'parents health', 'age 60', 'age 65', 'age 70', 'retire'],
        response: "**Senior Citizen Health Insurance** — what to look for:\n\n✅ Entry age up to 65–80 years available\n✅ Pre-existing disease coverage after 1–3 year waiting period\n✅ Annual health check-ups included\n✅ AYUSH treatment (Ayurveda, Yoga, Homeopathy) often covered\n\n⚠️ **Challenges**:\n• Premiums are 3–5x higher for age 60+\n• Sub-limits on room rent more common\n• Co-payment clauses (10–20% borne by insured) common\n\n💡 *Compare Star Health Senior Red Carpet, Niva Bupa Senior First, and Care Senior*",
        actions: [
            { label: 'Senior Citizen Guide', href: '/insurance/senior-citizen', icon: Shield },
            { label: 'Compare Plans', href: '/tools/compare', icon: Scale },
        ]
    },

    // ── Premium / Cost / Calculator ───────────────────────────────────────
    {
        keywords: ['premium', 'cost', 'price', 'how much', 'calculat', 'estimate', 'quote', 'affordable', 'cheap insur', 'low cost', 'monthly payment', 'yearly payment', 'annual premium'],
        response: "Let me help you estimate your premium! Factors that affect insurance costs:\n\n🏥 **Health Insurance**: Age, city, sum insured, pre-existing diseases\n💀 **Term Life**: Age, sum assured, policy term, tobacco use, occupation\n🚗 **Motor**: IDV (vehicle value), age of vehicle, add-ons, NCB\n🏠 **Home**: Built-up area, location, construction type, contents value\n\nUse our **Premium Calculator** for instant estimates — free, no registration needed!",
        actions: [
            { label: 'Premium Calculator', href: '/tools/calculator', icon: Calculator },
            { label: 'Compare Policies', href: '/tools/compare', icon: Scale },
        ]
    },

    // ── Claims ────────────────────────────────────────────────────────────
    {
        keywords: ['claim', 'how to claim', 'claim process', 'claim rejected', 'claim settle', 'claim denied', 'file a claim', 'reimbursement', 'cashless claim', 'claim status', 'irdai complaint'],
        response: "**How to Process an Insurance Claim:**\n\n📞 **Step 1**: Notify your insurer immediately (most have 24/7 helplines)\n📋 **Step 2**: Collect all documents (bills, FIR if applicable, medical reports)\n📝 **Step 3**: Fill claim form (online or offline)\n🏥 **Step 4**: Cashless = insurer pays hospital directly. Reimbursement = you pay, then get refunded\n\n⚠️ **Common Reasons Claims Are Rejected**:\n• Non-disclosure of pre-existing conditions\n• Claim filed after deadline\n• Policy lapsed or premium unpaid\n• Treatment from non-network hospital (for cashless)\n\n💡 *If claim is rejected unfairly, escalate to IRDAI Bima Bharosa portal*",
        actions: [
            { label: 'Real Claim Cases', href: '/tools/claim-cases', icon: FileText },
            { label: 'Hidden Facts Tool', href: '/tools/hidden-facts', icon: AlertCircle },
        ]
    },

    // ── Hidden Facts / Exclusions ─────────────────────────────────────────
    {
        keywords: ['hidden', 'exclusion', 'fine print', 'not covered', 'what is not', 'what isnt', "coverage gap", 'loophole', 'trap', 'trick', 'what they hide', 'secret'],
        response: "💡 **Insurance companies often hide things in the fine print.** Common hidden exclusions:\n\n🔴 **Health**: Sub-limits on room rent, co-payment for senior citizens, waiting periods for pre-existing diseases\n🔴 **Term Life**: Suicide within 1 year, adventure sports, fraud by nominee\n🔴 **Motor**: Depreciation on parts (can reduce claim by half!), flood damage to engine, drunk driving\n🔴 **Travel**: Pre-existing conditions, alcohol-related incidents, extreme sports\n🔴 **Home**: Wear & tear, willful negligence, gradual deterioration\n\nUse our **Hidden Facts Revealer** to check 150+ exclusions by category!",
        actions: [
            { label: 'Hidden Facts Revealer', href: '/tools/hidden-facts', icon: AlertCircle },
            { label: 'Claim Cases', href: '/tools/claim-cases', icon: FileText },
        ]
    },

    // ── Comparison ────────────────────────────────────────────────────────
    {
        keywords: ['compar', 'best insur', 'which is better', 'vs', 'difference between', 'recommend', 'suggest', 'which plan', 'which company', 'top insur', 'best plan'],
        response: "Comparing insurance policies? Here's how to do it right:\n\n✅ **Coverage** — Does it cover your specific needs?\n✅ **Premium** — Affordable for the long term?\n✅ **Claim Settlement Ratio (CSR)** — Higher is better (aim for 95%+)\n✅ **Network Hospitals** — Enough near you?\n✅ **Exclusions** — Read carefully!\n✅ **Add-ons** — Are important riders available?\n\nTop insurers by category:\n🏥 Health: Niva Bupa, Star Health, HDFC Ergo\n💀 Term Life: LIC, HDFC Life, ICICI Prudential\n🚗 Motor: Acko, Digit, ICICI Lombard",
        actions: [
            { label: 'Policy Comparison Tool', href: '/tools/compare', icon: Scale },
            { label: 'Expert Guides', href: '/resources', icon: BookOpen },
        ]
    },

    // ── IRDAI / Regulation ────────────────────────────────────────────────
    {
        keywords: ['irdai', 'regulator', 'complain', 'ombudsman', 'grievance', 'insurance regul', 'bima', 'insurance authority', 'legal'],
        response: "**IRDAI (Insurance Regulatory and Development Authority of India)** regulates all insurance companies.\n\n📌 **Important IRDAI facts**:\n• All insurers must settle life insurance claims within 30 days\n• Health claims must be settled within 15 days of last document submission\n• If dissatisfied, escalate to **Insurance Ombudsman** (free grievance redressal)\n• Online complaint: **Bima Bharosa** portal (bimabharosa.irdai.gov.in)\n\nInsuranceClarity is an educational platform — we do NOT sell insurance and are not IRDAI-licensed.",
        actions: [
            { label: 'Resources & Guides', href: '/resources', icon: BookOpen },
            { label: 'Real Claim Cases', href: '/tools/claim-cases', icon: FileText },
        ]
    },

    // ── Personal Accident / Disability ────────────────────────────────────
    {
        keywords: ['personal accident', 'accident insur', 'disability insur', 'disability cover', 'pa cover', 'accidental death', 'temporary disabil', 'permanent disabil', 'income protection'],
        response: "**Personal Accident & Disability Insurance** — often overlooked but vital:\n\n✅ Pays lump sum or weekly income if you're disabled due to accident\n✅ Accidental Death Benefit — pays double or more the sum insured\n✅ Very affordable — ₹5,000–₹15,000/year for ₹1 Cr cover\n\n📋 **Types of Disability Covered**:\n• Permanent Total Disability (100% payout)\n• Permanent Partial Disability (% based on severity)\n• Temporary Total Disability (weekly income)\n\n⚠️ Does NOT cover illness-related disability — you need a separate Critical Illness plan for that",
        actions: [
            { label: 'Personal Accident Guide', href: '/insurance/personal-accident', icon: Shield },
            { label: 'Disability Cover', href: '/insurance/disability', icon: AlertCircle },
        ]
    },

    // ── Download / Resources / Guides ─────────────────────────────────────
    {
        keywords: ['download', 'pdf', 'guide', 'ebook', 'checklist', 'resource', 'document', 'article', 'read'],
        response: "📚 Our **Resources Hub** has free downloadable guides on:\n\n✅ Term Insurance Buying Checklist\n✅ Health Insurance Exclusion Guide\n✅ Motor Insurance Claim Process\n✅ How to Read a Policy Document\n✅ IRDAI Glossary of Terms\n\nAll guides are written by insurance professionals and are completely free — no signup needed!",
        actions: [
            { label: 'Browse Resources', href: '/resources', icon: BookOpen },
            { label: 'Hidden Facts Tool', href: '/tools/hidden-facts', icon: AlertCircle },
        ]
    },

    // ── Support / Donation ────────────────────────────────────────────────
    {
        keywords: ['support', 'donate', 'coffee', 'funding', 'contribute', 'buy me a coffee', 'help the site', 'ad free'],
        response: "☕ InsuranceClarity is a free, ad-free educational platform. We rely on community support to stay independent.\n\nYour contribution helps us:\n• Maintain 150+ insurance fact sheets\n• Build better comparison tools\n• Keep the platform 100% ad-free\n\nEven a small amount goes a long way — thank you! 🙏",
        actions: [
            { label: 'Support Our Mission', href: 'https://buymeacoffee.com/insuranceclarity', icon: Coffee },
        ]
    },

    // ── Maternity ─────────────────────────────────────────────────────────
    {
        keywords: ['maternity', 'pregnancy', 'delivery', 'childbirth', 'newborn', 'baby insur', 'maternity cover'],
        response: "**Maternity Insurance** is typically part of comprehensive health plans:\n\n✅ Covers normal delivery (₹25,000–₹50,000) and C-section (₹50,000–₹1L)\n✅ Newborn baby covered from Day 1 in most plans\n✅ Pre and post-natal checkups may be covered\n\n⚠️ **Key Facts**:\n• Waiting period of **9–24 months** before you can claim maternity benefits\n• Plan ahead — buy health insurance **before** trying to conceive!\n• Sub-limits on maternity are very common",
        actions: [
            { label: 'Maternity Insurance Guide', href: '/insurance/maternity', icon: Heart },
            { label: 'Family Floater Plans', href: '/insurance/family-floater', icon: Shield },
        ]
    },
]

// ─── Smart Intent Resolver ─────────────────────────────────────────────────
function resolveIntent(input: string): typeof INTENTS[0] | null {
    const lower = input.toLowerCase().trim()

    // Score-based matching: count how many keywords match, pick highest score
    let bestMatch: typeof INTENTS[0] | null = null
    let bestScore = 0

    for (const intent of INTENTS) {
        let score = 0
        for (const keyword of intent.keywords) {
            if (lower.includes(keyword)) {
                // Longer keyword = more specific = higher score
                score += keyword.length
            }
        }
        if (score > bestScore) {
            bestScore = score
            bestMatch = intent
        }
    }

    // Minimum score threshold — avoid spurious matches on single letters
    return bestScore >= 2 ? bestMatch : null
}

// ─── Generic fallback responses (cycled to avoid repetition) ─────────────
const FALLBACKS = [
    {
        text: "I'm not sure I fully understood that. Could you rephrase? You can ask me about:\n• A specific insurance type (life, health, motor, home, travel)\n• How to file a claim\n• How to compare policies\n• What exclusions to watch out for",
        actions: [
            { label: 'All Insurance Types', href: '/', icon: Shield },
            { label: 'Hidden Facts', href: '/tools/hidden-facts', icon: AlertCircle },
        ]
    },
    {
        text: "Hmm, I didn't quite catch that! Try asking me something like:\n• \"What is term insurance?\"\n• \"How do I claim health insurance?\"\n• \"What does motor insurance not cover?\"\n• \"How much does health insurance cost?\"",
        actions: [
            { label: 'Premium Calculator', href: '/tools/calculator', icon: Calculator },
            { label: 'Compare Policies', href: '/tools/compare', icon: Scale },
        ]
    },
    {
        text: "I may have missed that one! I'm trained to help with Indian insurance — try asking about any type of insurance, premium costs, claim tips, or policy exclusions.",
        actions: [
            { label: 'Browse Resources', href: '/resources', icon: BookOpen },
            { label: 'Claim Cases', href: '/tools/claim-cases', icon: FileText },
        ]
    }
]

let fallbackIdx = 0

// ─── Component ─────────────────────────────────────────────────────────────
export default function ClarityAdvisor() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [hasNewMessage, setHasNewMessage] = useState(false)
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Context-aware page greeting
    const getContextGreeting = (): { text: string; actions: Message['actions'] } => {
        if (pathname?.includes('/tools/calculator')) {
            return {
                text: "👋 It looks like you're using the **Premium Calculator**! Need help understanding any fields — like IDV, NCB, or sum insured? Just ask!",
                actions: [{ label: 'Calculator Guide', href: '/resources', icon: Calculator }]
            }
        }
        if (pathname?.includes('/tools/hidden-facts')) {
            return {
                text: "👋 Welcome to the **Hidden Facts Revealer**! Ask me about any insurance exclusion, or I can explain what any fact means.",
                actions: [{ label: 'Claim Cases', href: '/tools/claim-cases', icon: FileText }]
            }
        }
        if (pathname?.includes('/tools/compare')) {
            return {
                text: "👋 I see you're comparing policies! I can help explain what to look for — CSR ratios, room rent limits, network hospitals, and more.",
                actions: [{ label: 'Expert Guides', href: '/resources', icon: BookOpen }]
            }
        }
        if (pathname?.includes('/insurance/')) {
            const type = pathname.split('/insurance/')[1]?.replace(/-/g, ' ')
            return {
                text: `👋 You're reading about **${type} insurance**. Ask me anything about it — coverage, exclusions, premiums, or how to claim!`,
                actions: [
                    { label: 'Hidden Facts', href: '/tools/hidden-facts', icon: AlertCircle },
                    { label: 'Calculator', href: '/tools/calculator', icon: Calculator }
                ]
            }
        }
        return {
            text: "👋 Hi! I'm your **Clarity Advisor** — India's smartest insurance guide.\n\nAsk me about any insurance type, policy exclusions, premiums, claims, or comparisons. I'll give you clear, honest answers!",
            actions: [
                { label: 'Calculate Premium', href: '/tools/calculator', icon: Calculator },
                { label: 'Expert Guides', href: '/resources', icon: BookOpen },
                { label: 'Hidden Facts', href: '/tools/hidden-facts', icon: AlertCircle },
            ]
        }
    }

    // Initial greeting on mount
    useEffect(() => {
        if (messages.length === 0) {
            setTimeout(() => {
                const greeting = getContextGreeting()
                addBotMessage(greeting.text, greeting.actions)
                if (!isOpen) setHasNewMessage(true)
            }, 900)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const addBotMessage = (text: string, actions?: Message['actions']) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            type: 'bot',
            text,
            actions
        }])
    }

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return

        const userText = inputValue.trim()
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            text: userText
        }])
        setInputValue('')
        setIsTyping(true)

        // Simulate AI thinking delay (realistic)
        setTimeout(() => {
            const intent = resolveIntent(userText)

            if (intent) {
                addBotMessage(intent.response, intent.actions.length > 0 ? intent.actions : undefined)
            } else {
                // Rotate through fallbacks
                const fb = FALLBACKS[fallbackIdx % FALLBACKS.length]
                fallbackIdx++
                addBotMessage(fb.text, fb.actions)
            }

            setIsTyping(false)
        }, 900 + Math.random() * 400) // slight variance feels more natural
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const toggleOpen = () => {
        setIsOpen(!isOpen)
        setHasNewMessage(false)
    }

    const clearChat = () => {
        setMessages([])
        fallbackIdx = 0
        setTimeout(() => {
            const greeting = getContextGreeting()
            addBotMessage(greeting.text, greeting.actions)
        }, 300)
    }

    // Format message text — convert **bold** and \n to JSX
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.+?)\*\*/g)
            return (
                <span key={i}>
                    {parts.map((part, j) =>
                        j % 2 === 1
                            ? <strong key={j} className="font-semibold text-theme-primary">{part}</strong>
                            : <span key={j}>{part}</span>
                    )}
                    {i < text.split('\n').length - 1 && <br />}
                </span>
            )
        })
    }

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="mb-4 w-[390px] max-w-[95vw] h-[600px] flex flex-col overflow-hidden rounded-3xl border border-default shadow-3xl bg-theme-primary"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-accent flex items-center justify-between text-white shadow-lg shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-accent rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-none flex items-center gap-1.5">
                                        Clarity Advisor
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                            Insurance Expert AI
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={clearChat} title="Clear chat" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button onClick={toggleOpen} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth bg-slate-50/50 dark:bg-slate-900/50"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                                >
                                    <div className={`flex gap-3 max-w-[88%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border ${msg.type === 'bot'
                                            ? 'bg-accent text-white border-accent'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-default'
                                            }`}>
                                            {msg.type === 'bot' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        {/* Bubble */}
                                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'bot'
                                            ? 'rounded-tl-none bg-white dark:bg-slate-800 text-theme-primary border border-default'
                                            : 'rounded-tr-none bg-accent text-white'
                                            }`}>
                                            {formatText(msg.text)}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="grid grid-cols-1 gap-1.5 w-full max-w-[88%] ml-10">
                                            {msg.actions.map((action) => (
                                                <Link
                                                    key={action.label}
                                                    href={action.href}
                                                    target={action.href.startsWith('http') ? '_blank' : undefined}
                                                    rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    onClick={() => { if (!action.href.startsWith('http')) setIsOpen(false) }}
                                                    className="flex items-center justify-between p-2.5 rounded-xl border border-default
                                                             bg-white dark:bg-slate-800 hover:border-accent hover:bg-accent/5
                                                             transition-all group text-xs font-semibold text-theme-primary hover:text-accent shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <action.icon className="w-3.5 h-3.5 text-accent" />
                                                        {action.label}
                                                    </div>
                                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center animate-pulse shrink-0">
                                        <Bot className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-default flex gap-1.5 items-center shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Suggestion Chips — visible when chat is fresh */}
                        {messages.length <= 1 && !isTyping && (
                            <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                                {['What is term insurance?', 'Health insurance exclusions', 'How to claim?', 'Compare policies'].map(chip => (
                                    <button
                                        key={chip}
                                        onClick={() => { setInputValue(chip); }}
                                        className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-default
                                                 rounded-full text-theme-secondary hover:border-accent hover:text-accent transition-all shadow-sm"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 border-t border-default bg-white dark:bg-slate-900 shrink-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask anything about insurance..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm
                                             focus:ring-2 focus:ring-accent transition-all text-theme-primary outline-none shadow-inner"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                <span className="text-[10px] text-theme-muted flex items-center gap-1 font-medium">
                                    <Shield className="w-3 h-3 text-accent" /> Insurance Expert
                                </span>
                                <span className="text-[10px] text-theme-muted flex items-center gap-1 font-medium">
                                    <Zap className="w-3 h-3 text-accent" /> Instant Answers
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={toggleOpen}
                className="relative w-16 h-16 rounded-3xl bg-gradient-accent shadow-2xl flex items-center justify-center text-white
                         focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all"
                aria-label="Open Clarity Advisor"
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X className="w-7 h-7" />
                        </motion.div>
                        : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <MessageSquare className="w-7 h-7" />
                        </motion.div>
                    }
                </AnimatePresence>

                {/* Pulse ring */}
                {!isOpen && <span className="absolute inset-0 rounded-3xl bg-accent animate-ping opacity-20 pointer-events-none" />}

                {/* Notification badge */}
                {hasNewMessage && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white">1</span>
                )}

                {/* Tooltip */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute right-20 bg-theme-primary border border-default px-4 py-2 rounded-xl shadow-xl text-xs font-bold whitespace-nowrap text-accent hidden md:block pointer-events-none"
                    >
                        Ask Clarity Advisor
                    </motion.div>
                )}
            </motion.button>
        </div>
    )
}
