export const INTENTS = [
    // ── Greetings ──────────────────────────────────────────────────────────
    {
        keywords: ['hi', 'hello', 'hey', 'greet', 'morning', 'evening', 'good day', 'yo', 'namaste', 'hola'],
        response: "Hello! 👋 I'm your Clarity Advisor — India's smartest insurance guide. Tell me what you need:\n• What type of insurance are you looking for?\n• Do you want to compare policies?\n• Need help understanding a claim?\n\nJust type naturally and I'll help!",
        actions: [
            { label: 'Calculate Premium', href: '/tools/calculator', icon: 'Calculator' },
            { label: 'Expert Guides', href: '/resources', icon: 'BookOpen' },
        ]
    },

    // ── About the bot ──────────────────────────────────────────────────────
    {
        keywords: ['who are you', 'what are you', 'what can you do', 'your name', 'about you', 'help me', 'what do you', 'purpose', 'bot', 'advisor', 'clarity advisor'],
        response: "I'm the **Clarity Advisor** — built specifically for InsuranceClarity India. I can:\n\n🔍 Explain any insurance type (Life, Health, Motor, Home, Travel…)\n📊 Help you estimate premiums\n📋 Guide you through claim processes\n⚠️ Reveal hidden policy exclusions\n🔗 Direct you to the right tools & guides\n\nWhat would you like help with today?",
        actions: [
            { label: 'Hidden Facts Tool', href: '/tools/hidden-facts', icon: 'AlertCircle' },
            { label: 'Compare Policies', href: '/tools/compare', icon: 'Scale' },
        ]
    },

    // ── What type of insurance ──────────────────────────────────────────────
    {
        keywords: ['what type', 'which type', 'type of insur', 'what insur', 'which insur', 'what kind', 'which kind', 'types of', 'kinds of', 'insurance options', 'different insur', 'categories'],
        response: "Great question! Here are the main insurance categories:\n\n🔴 **Life & Health**: Term Life, Whole Life, Health, Family Floater, Senior Citizen, Critical Illness, Maternity\n🚗 **Motor**: Car, Two-Wheeler, Commercial Vehicle\n🏠 **Property**: Home, Fire, Contents\n✈️ **Travel**: Domestic, International\n💎 **Specialized**: Disability, Personal Accident, Pet, Gadget\n🏢 **Business**: Commercial, Cyber, Liability, Marine\n\nWhich category interests you most?",
        actions: [
            { label: 'Life Insurance', href: '/insurance/life', icon: 'Heart' },
            { label: 'Health Insurance', href: '/insurance/health', icon: 'Shield' },
            { label: 'Motor Insurance', href: '/insurance/motor', icon: 'Navigation' },
            { label: 'All Types', href: '/', icon: 'BookOpen' },
        ]
    },

    // ── Term Life ──────────────────────────────────────────────────────────
    {
        keywords: ['term life', 'term plan', 'term policy', 'term insur', 'pure protection', 'death benefit', 'sum assured', 'nominee'],
        response: "**Term Life Insurance** is the most cost-effective form of life cover. Here's what you should know:\n\n✅ Pays a lump sum to your family if you pass away during the policy term\n✅ No maturity benefit (pure risk cover = cheap premiums)\n✅ Coverage of ₹1–5 Cr available for ₹700–₹1,200/month\n⚠️ Hidden Fact: Most term plans exclude suicide within the first year, death due to adventure sports, and drug/alcohol-related deaths\n\n💡 *Ideal for: Anyone with dependents or loans*",
        actions: [
            { label: 'Term Insurance Guide', href: '/insurance/term-life', icon: 'Shield' },
            { label: 'Calculate Premium', href: '/tools/calculator', icon: 'Calculator' },
            { label: 'Hidden Exclusions', href: '/tools/hidden-facts', icon: 'AlertCircle' },
        ]
    },

    // ── Life Insurance (general) ───────────────────────────────────────────
    {
        keywords: ['life insur', 'whole life', 'endowment', 'ulip', 'money back', 'lic', 'life cover', 'life plan'],
        response: "**Life Insurance** comes in several forms:\n\n📋 **Term Plan** — Pure protection, high cover, low cost (₹700–₹1,200/month for ₹1 Cr)\n📋 **Whole Life** — Cover till age 99/100, builds cash value\n📋 **ULIP** — Insurance + investment in market-linked funds\n📋 **Endowment** — Maturity payout + death benefit\n📋 **Money Back** — Periodic payouts during policy term\n\n⚠️ *ULIPs and Endowments often have high charges — read the fine print!*",
        actions: [
            { label: 'Life Insurance Page', href: '/insurance/life', icon: 'Heart' },
            { label: 'Term vs ULIP Guide', href: '/resources', icon: 'BookOpen' },
            { label: 'Hidden Facts', href: '/tools/hidden-facts', icon: 'AlertCircle' },
        ]
    },

    // ── Health Insurance ───────────────────────────────────────────────────
    {
        keywords: ['health insur', 'medical insur', 'mediclaim', 'hospitaliz', 'hospital', 'doctor', 'illness', 'disease', 'surgery', 'icu', 'health plan', 'health cover', 'health policy', 'cashless'],
        response: "**Health Insurance** protects your savings from medical emergencies. Key things to check:\n\n✅ Room rent limit (Beware: sub-limits can cut your claim by 40%!)\n✅ Waiting period for pre-existing diseases (usually 2–4 years)\n✅ Network hospitals (cashless treatment)\n✅ Day-care procedures covered?\n✅ Maternity cover (usually 9–24 month waiting period)\n\n⚠️ **Common Exclusion**: Most policies don't cover dental, vision, cosmetic surgery, or obesity treatment\n\n💡 *Tip: Family floater is cheaper if everyone is young & healthy*",
        actions: [
            { label: 'Health Insurance Guide', href: '/insurance/health', icon: 'Shield' },
            { label: 'Family Floater', href: '/insurance/family-floater', icon: 'Heart' },
            { label: 'Critical Illness Cover', href: '/insurance/critical-illness', icon: 'AlertCircle' },
        ]
    },

    // ── Motor / Car / Bike ─────────────────────────────────────────────────
    {
        keywords: ['car insur', 'bike insur', 'motor insur', 'vehicle insur', 'two wheeler', 'auto insur', 'third party', 'comprehensive', 'own damage', 'idv', 'no claim bonus', 'ncb', 'accident claim', 'garage', 'cashless repair'],
        response: "**Motor Insurance** is mandatory in India. Here's what matters:\n\n📋 **Third Party** (mandatory) — Covers damage to others only. Very cheap (~₹2,000/year)\n📋 **Comprehensive** — Covers your car + third party. Recommended!\n📋 **Own Damage Add-ons**: Zero depreciation, Engine Protect, Return to Invoice, Roadside Assistance\n\n⚠️ **Hidden Facts**:\n• Depreciation on parts can reduce your claim by 30–50%\n• NCB (up to 50%) is lost if you file even a small claim\n• Flood/engine damage not covered in basic plans without add-ons\n\n💡 *Always buy Zero Depreciation + Engine Protection add-ons*",
        actions: [
            { label: 'Motor Insurance Guide', href: '/insurance/motor', icon: 'Navigation' },
            { label: 'Hidden Motor Facts', href: '/tools/hidden-facts', icon: 'AlertCircle' },
            { label: 'Compare Policies', href: '/tools/compare', icon: 'Scale' },
        ]
    },

    // ── Home Insurance ─────────────────────────────────────────────────────
    {
        keywords: ['home insur', 'house insur', 'property insur', 'building insur', 'flat insur', 'fire insur', 'contents insur', 'burglary', 'theft home', 'earthquake cover'],
        response: "**Home Insurance** is grossly underutilised in India but extremely valuable:\n\n✅ **Building Cover** — Covers structure against fire, earthquake, flood, lightning\n✅ **Contents Cover** — Furniture, electronics, jewellery\n✅ **All-Risk Cover** — Accidental damage to valuables\n\n⚠️ **Key Exclusions**:\n• Wear & tear is NEVER covered\n• Jewellery claims require a separate schedule/declaration\n• War, nuclear perils excluded everywhere\n\n💰 *Very affordable — ₹3,000–₹8,000/year for ₹50L cover!*",
        actions: [
            { label: 'Home Insurance Guide', href: '/insurance/home', icon: 'Home' },
            { label: 'Hidden Exclusions', href: '/tools/hidden-facts', icon: 'AlertCircle' },
        ]
    },

    // ── Travel Insurance ──────────────────────────────────────────────────
    {
        keywords: ['travel insur', 'trip insur', 'flight insur', 'trip cancel', 'luggage insur', 'baggage', 'lost passport', 'medical abroad', 'international travel', 'visa insur', 'schengen'],
        response: "**Travel Insurance** is essential especially for international trips:\n\n✅ Medical emergency abroad (can cost ₹10–₹50 Lakhs!)\n✅ Trip cancellation/interruption\n✅ Baggage loss or delay\n✅ Passport loss\n✅ Flight delay compensation\n\n⚠️ **Hidden Exclusions**:\n• Pre-existing conditions NOT covered (even if stable)\n• Adventure sports (trekking, diving) need special add-ons\n• Schengen visa requires minimum $30,000 medical cover\n\n💡 *Buy at least $1 Lakh medical cover for US/Europe trips*",
        actions: [
            { label: 'Travel Insurance Guide', href: '/insurance/travel', icon: 'Plane' },
            { label: 'Get Quote Estimate', href: '/tools/calculator', icon: 'Calculator' },
        ]
    },

    // ── Critical Illness ──────────────────────────────────────────────────
    {
        keywords: ['critical illness', 'cancer insur', 'heart attack insur', 'stroke cover', 'kidney failure', 'ci plan', 'lump sum on diagnosis', 'serious illness'],
        response: "**Critical Illness Insurance** pays a lump sum on diagnosis of serious diseases:\n\n✅ Cancer, Heart Attack, Stroke, Kidney Failure, Major Organ Transplant\n✅ Money can be used for treatment, income replacement, or anything!\n✅ Works *alongside* your health insurance\n\n⚠️ **Key Facts**:\n• Survival period clause: Must survive 30 days after diagnosis to claim\n• Waiting period: Usually 90 days from purchase\n• Pre-existing CI conditions excluded\n\n💡 *Best for high-risk individuals or family history of serious disease*",
        actions: [
            { label: 'Critical Illness Guide', href: '/insurance/critical-illness', icon: 'AlertCircle' },
            { label: 'Compare Plans', href: '/tools/compare', icon: 'Scale' },
        ]
    },

    // ── Senior Citizen ────────────────────────────────────────────────────
    {
        keywords: ['senior citizen', 'parent insur', 'elderly insur', 'old age insur', 'parents health', 'age 60', 'age 65', 'age 70', 'retire'],
        response: "**Senior Citizen Health Insurance** — what to look for:\n\n✅ Entry age up to 65–80 years available\n✅ Pre-existing disease coverage after 1–3 year waiting period\n✅ Annual health check-ups included\n✅ AYUSH treatment (Ayurveda, Yoga, Homeopathy) often covered\n\n⚠️ **Challenges**:\n• Premiums are 3–5x higher for age 60+\n• Sub-limits on room rent more common\n• Co-payment clauses (10–20% borne by insured) common\n\n💡 *Compare Star Health Senior Red Carpet, Niva Bupa Senior First, and Care Senior*",
        actions: [
            { label: 'Senior Citizen Guide', href: '/insurance/senior-citizen', icon: 'Shield' },
            { label: 'Compare Plans', href: '/tools/compare', icon: 'Scale' },
        ]
    },

    // ── Premium / Cost / Calculator ───────────────────────────────────────
    {
        keywords: ['premium', 'cost', 'price', 'how much', 'calculat', 'estimate', 'quote', 'affordable', 'cheap insur', 'low cost', 'monthly payment', 'yearly payment', 'annual premium'],
        response: "Let me help you estimate your premium! Factors that affect insurance costs:\n\n🏥 **Health Insurance**: Age, city, sum insured, pre-existing diseases\n💀 **Term Life**: Age, sum assured, policy term, tobacco use, occupation\n🚗 **Motor**: IDV (vehicle value), age of vehicle, add-ons, NCB\n🏠 **Home**: Built-up area, location, construction type, contents value\n\nUse our **Premium Calculator** for instant estimates — free, no registration needed!",
        actions: [
            { label: 'Premium Calculator', href: '/tools/calculator', icon: 'Calculator' },
            { label: 'Compare Policies', href: '/tools/compare', icon: 'Scale' },
        ]
    },

    // ── Claims ────────────────────────────────────────────────────────────
    {
        keywords: ['claim', 'how to claim', 'claim process', 'claim rejected', 'claim settle', 'claim denied', 'file a claim', 'reimbursement', 'cashless claim', 'claim status', 'irdai complaint'],
        response: "**How to Process an Insurance Claim:**\n\n📞 **Step 1**: Notify your insurer immediately (most have 24/7 helplines)\n📋 **Step 2**: Collect all documents (bills, FIR if applicable, medical reports)\n📝 **Step 3**: Fill claim form (online or offline)\n🏥 **Step 4**: Cashless = insurer pays hospital directly. Reimbursement = you pay, then get refunded\n\n⚠️ **Common Reasons Claims Are Rejected**:\n• Non-disclosure of pre-existing conditions\n• Claim filed after deadline\n• Policy lapsed or premium unpaid\n• Treatment from non-network hospital (for cashless)\n\n💡 *If claim is rejected unfairly, escalate to IRDAI Bima Bharosa portal*",
        actions: [
            { label: 'Real Claim Cases', href: '/tools/claim-cases', icon: 'FileText' },
            { label: 'Hidden Facts Tool', href: '/tools/hidden-facts', icon: 'AlertCircle' },
        ]
    },

    // ── Hidden Facts / Exclusions ─────────────────────────────────────────
    {
        keywords: ['hidden', 'exclusion', 'fine print', 'not covered', 'what is not', 'what isnt', "coverage gap", 'loophole', 'trap', 'trick', 'what they hide', 'secret'],
        response: "💡 **Insurance companies often hide things in the fine print.** Common hidden exclusions:\n\n🔴 **Health**: Sub-limits on room rent, co-payment for senior citizens, waiting periods for pre-existing diseases\n🔴 **Term Life**: Suicide within 1 year, adventure sports, fraud by nominee\n🔴 **Motor**: Depreciation on parts (can reduce claim by half!), flood damage to engine, drunk driving\n🔴 **Travel**: Pre-existing conditions, alcohol-related incidents, extreme sports\n🔴 **Home**: Wear & tear, willful negligence, gradual deterioration\n\nUse our **Hidden Facts Revealer** to check 150+ exclusions by category!",
        actions: [
            { label: 'Hidden Facts Revealer', href: '/tools/hidden-facts', icon: 'AlertCircle' },
            { label: 'Claim Cases', href: '/tools/claim-cases', icon: 'FileText' },
        ]
    },

    // ── Comparison ────────────────────────────────────────────────────────
    {
        keywords: ['compar', 'best insur', 'which is better', 'vs', 'difference between', 'recommend', 'suggest', 'which plan', 'which company', 'top insur', 'best plan'],
        response: "Comparing insurance policies? Here's how to do it right:\n\n✅ **Coverage** — Does it cover your specific needs?\n✅ **Premium** — Affordable for the long term?\n✅ **Claim Settlement Ratio (CSR)** — Higher is better (aim for 95%+)\n✅ **Network Hospitals** — Enough near you?\n✅ **Exclusions** — Read carefully!\n✅ **Add-ons** — Are important riders available?\n\nTop insurers by category:\n🏥 Health: Niva Bupa, Star Health, HDFC Ergo\n💀 Term Life: LIC, HDFC Life, ICICI Prudential\n🚗 Motor: Acko, Digit, ICICI Lombard",
        actions: [
            { label: 'Policy Comparison Tool', href: '/tools/compare', icon: 'Scale' },
            { label: 'Expert Guides', href: '/resources', icon: 'BookOpen' },
        ]
    },

    // ── IRDAI / Regulation ────────────────────────────────────────────────
    {
        keywords: ['irdai', 'regulator', 'complain', 'ombudsman', 'grievance', 'insurance regul', 'bima', 'insurance authority', 'legal'],
        response: "**IRDAI (Insurance Regulatory and Development Authority of India)** regulates all insurance companies.\n\n📌 **Important IRDAI facts**:\n• All insurers must settle life insurance claims within 30 days\n• Health claims must be settled within 15 days of last document submission\n• If dissatisfied, escalate to **Insurance Ombudsman** (free grievance redressal)\n• Online complaint: **Bima Bharosa** portal (bimabharosa.irdai.gov.in)\n\nInsuranceClarity is an educational platform — we do NOT sell insurance and are not IRDAI-licensed.",
        actions: [
            { label: 'Resources & Guides', href: '/resources', icon: 'BookOpen' },
            { label: 'Real Claim Cases', href: '/tools/claim-cases', icon: 'FileText' },
        ]
    },

    // ── Personal Accident / Disability ────────────────────────────────────
    {
        keywords: ['personal accident', 'accident insur', 'disability insur', 'disability cover', 'pa cover', 'accidental death', 'temporary disabil', 'permanent disabil', 'income protection'],
        response: "**Personal Accident & Disability Insurance** — often overlooked but vital:\n\n✅ Pays lump sum or weekly income if you're disabled due to accident\n✅ Accidental Death Benefit — pays double or more the sum insured\n✅ Very affordable — ₹5,000–₹15,000/year for ₹1 Cr cover\n\n📋 **Types of Disability Covered**:\n• Permanent Total Disability (100% payout)\n• Permanent Partial Disability (% based on severity)\n• Temporary Total Disability (weekly income)\n\n⚠️ Does NOT cover illness-related disability — you need a separate Critical Illness plan for that",
        actions: [
            { label: 'Personal Accident Guide', href: '/insurance/personal-accident', icon: 'Shield' },
            { label: 'Disability Cover', href: '/insurance/disability', icon: 'AlertCircle' },
        ]
    },

    // ── Download / Resources / Guides ─────────────────────────────────────
    {
        keywords: ['download', 'pdf', 'guide', 'ebook', 'checklist', 'resource', 'document', 'article', 'read'],
        response: "📚 Our **Resources Hub** has free downloadable guides on:\n\n✅ Term Insurance Buying Checklist\n✅ Health Insurance Exclusion Guide\n✅ Motor Insurance Claim Process\n✅ How to Read a Policy Document\n✅ IRDAI Glossary of Terms\n\nAll guides are written by insurance professionals and are completely free — no signup needed!",
        actions: [
            { label: 'Browse Resources', href: '/resources', icon: 'BookOpen' },
            { label: 'Hidden Facts Tool', href: '/tools/hidden-facts', icon: 'AlertCircle' },
        ]
    },

    // ── Support / Donation ────────────────────────────────────────────────
    {
        keywords: ['support', 'donate', 'coffee', 'funding', 'contribute', 'buy me a coffee', 'help the site', 'ad free'],
        response: "☕ InsuranceClarity is a free, ad-free educational platform. We rely on community support to stay independent.\n\nYour contribution helps us:\n• Maintain 150+ insurance fact sheets\n• Build better comparison tools\n• Keep the platform 100% ad-free\n\nEven a small amount goes a long way — thank you! 🙏",
        actions: [
            { label: 'Support Our Mission', href: 'https://buymeacoffee.com/insuranceclarity', icon: 'Coffee' },
        ]
    },

    // ── Maternity ─────────────────────────────────────────────────────────
    {
        keywords: ['maternity', 'pregnancy', 'delivery', 'childbirth', 'newborn', 'baby insur', 'maternity cover'],
        response: "**Maternity Insurance** is typically part of comprehensive health plans:\n\n✅ Covers normal delivery (₹25,000–₹50,000) and C-section (₹50,000–₹1L)\n✅ Newborn baby covered from Day 1 in most plans\n✅ Pre and post-natal checkups may be covered\n\n⚠️ **Key Facts**:\n• Waiting period of **9–24 months** before you can claim maternity benefits\n• Plan ahead — buy health insurance **before** trying to conceive!\n• Sub-limits on maternity are very common",
        actions: [
            { label: 'Maternity Insurance Guide', href: '/insurance/maternity', icon: 'Heart' },
            { label: 'Family Floater Plans', href: '/insurance/family-floater', icon: 'Shield' },
        ]
    },
]

export const FALLBACKS = [
    {
        text: "I'm not sure I fully understood that. Could you rephrase? You can ask me about:\n• A specific insurance type (life, health, motor, home, travel)\n• How to file a claim\n• How to compare policies\n• What exclusions to watch out for",
        actions: [
            { label: 'All Insurance Types', href: '/', icon: 'Shield' },
            { label: 'Hidden Facts', href: '/tools/hidden-facts', icon: 'AlertCircle' },
        ]
    },
    {
        text: "Hmm, I didn't quite catch that! Try asking me something like:\n• \"What is term insurance?\"\n• \"How do I claim health insurance?\"\n• \"What does motor insurance not cover?\"\n• \"How much does health insurance cost?\"",
        actions: [
            { label: 'Premium Calculator', href: '/tools/calculator', icon: 'Calculator' },
            { label: 'Compare Policies', href: '/tools/compare', icon: 'Scale' },
        ]
    },
    {
        text: "I may have missed that one! I'm trained to help with Indian insurance — try asking about any type of insurance, premium costs, claim tips, or policy exclusions.",
        actions: [
            { label: 'Browse Resources', href: '/resources', icon: 'BookOpen' },
            { label: 'Claim Cases', href: '/tools/claim-cases', icon: 'FileText' },
        ]
    }
]
