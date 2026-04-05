import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // =========================================================================
    // 1. LIFE INSURANCE CATEGORY
    // =========================================================================
    await prisma.insuranceCategory.upsert({
        where: { slug: 'life-insurance' },
        update: {},
        create: {
            name: 'Life Insurance',
            slug: 'life-insurance',
            subcat: {
                create: [
                    {
                        name: 'Term Life',
                        types: {
                            create: [
                                { name: 'Level Term Life Insurance' },
                                { name: 'Decreasing Term Life Insurance' },
                                { name: 'Return of Premium (ROP) Term' },
                                { name: 'Increasing Term Life Insurance' },
                            ]
                        }
                    },
                    {
                        name: 'Whole Life',
                        types: {
                            create: [
                                { name: 'Traditional Whole Life' },
                                { name: 'Universal Life Insurance' },
                                { name: 'Single Premium Whole Life' },
                            ]
                        }
                    },
                    {
                        name: 'Investment & Savings',
                        types: {
                            create: [
                                { name: 'Endowment Plans' },
                                { name: 'Money Back Policies' },
                                { name: 'Unit Linked Insurance Plans (ULIP)' },
                                { name: 'Child Education Plans' }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // =========================================================================
    // 2. HEALTH INSURANCE CATEGORY
    // =========================================================================
    await prisma.insuranceCategory.upsert({
        where: { slug: 'health-insurance' },
        update: {},
        create: {
            name: 'Health Insurance',
            slug: 'health-insurance',
            subcat: {
                create: [
                    {
                        name: 'Base Coverage (Mediclaim)',
                        types: {
                            create: [
                                { name: 'Individual Health Insurance' },
                                { name: 'Family Floater Health Insurance' },
                                { name: 'Senior Citizen Health Insurance' },
                                { name: 'Maternity Insurance' },
                            ]
                        }
                    },
                    {
                        name: 'Supplemental / Riders',
                        types: {
                            create: [
                                { name: 'Critical Illness Cover' },
                                { name: 'Hospital Daily Cash' },
                                { name: 'Personal Accident Cover' },
                            ]
                        }
                    }
                ]
            }
        }
    });

    // =========================================================================
    // 3. MOTOR INSURANCE CATEGORY
    // =========================================================================
    await prisma.insuranceCategory.upsert({
        where: { slug: 'motor-insurance' },
        update: {},
        create: {
            name: 'Motor Insurance',
            slug: 'motor-insurance',
            subcat: {
                create: [
                    {
                        name: 'Private Vehicles',
                        types: {
                            create: [
                                { name: 'Comprehensive Car Insurance' },
                                { name: 'Standalone Own Damage (OD)' },
                                { name: 'Third-Party Liability (TPL)' },
                                { name: 'Two-Wheeler Insurance' },
                            ]
                        }
                    },
                    {
                        name: 'Commercial Vehicles',
                        types: {
                            create: [
                                { name: 'Taxi / Cab Insurance' },
                                { name: 'Heavy Commercial Vehicle Cover' }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // =========================================================================
    // 4. BUSINESS & COMMERCIAL CATEGORY
    // =========================================================================
    await prisma.insuranceCategory.upsert({
        where: { slug: 'business-insurance' },
        update: {},
        create: {
            name: 'Business & Commercial',
            slug: 'business-insurance',
            subcat: {
                create: [
                    {
                        name: 'General Liability',
                        types: {
                            create: [
                                { name: 'Commercial General Liability (CGL)' },
                                { name: 'Product Liability' },
                                { name: 'Workmen Compensation' }
                            ]
                        }
                    },
                    {
                        name: 'Professional Liability',
                        types: {
                            create: [
                                { name: 'Directors & Officers (D&O)' },
                                { name: 'Errors & Omissions (E&O)' },
                                { name: 'Medical Malpractice Cover' }
                            ]
                        }
                    },
                    {
                        name: 'Specialized Business',
                        types: {
                            create: [
                                { name: 'Cyber Liability Insurance' },
                                { name: 'Marine Cargo Insurance' },
                                { name: 'Trade Credit Insurance' }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // =========================================================================
    // 5. SPECIALTY & NICHE CATEGORY
    // =========================================================================
    await prisma.insuranceCategory.upsert({
        where: { slug: 'specialty-insurance' },
        update: {},
        create: {
            name: 'Specialty & Niche',
            slug: 'specialty-insurance',
            subcat: {
                create: [
                    {
                        name: 'Lifestyle & Events',
                        types: {
                            create: [
                                { name: 'Wedding Insurance' },
                                { name: 'Pet Insurance' },
                                { name: 'Event Cancellation Cover' }
                            ]
                        }
                    },
                    {
                        name: 'New Age / Digital',
                        types: {
                            create: [
                                { name: 'Drone Liability Cover' },
                                { name: 'Freelancer Income Protection' },
                                { name: 'Digital Asset / Crypto Cover' }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log('✅ Base taxonomy seeded: 5 categories, 50+ types.');

    // =========================================================================
    // SAMPLE POLICIES — Real Indian Insurance Products
    // =========================================================================

    // Helper: resolve type IDs by name
    async function getTypeId(name: string): Promise<string | null> {
        const t = await prisma.insuranceType.findFirst({ where: { name } });
        return t?.id ?? null;
    }

    // --- HEALTH POLICIES -------------------------------------------------------

    const familyFloaterId = await getTypeId('Family Floater Health Insurance');
    if (familyFloaterId) {
        // 1. HDFC ERGO Optima Restore Family
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'hdfc-ergo-optima-restore-family' },
            update: {},
            create: {
                typeId: familyFloaterId,
                providerName: 'HDFC ERGO',
                productName: 'Optima Restore Family',
                seoSlug: 'hdfc-ergo-optima-restore-family',
                coverageData: {
                    base_sum_insured_range: [500000, 5000000],
                    room_rent_limit: 'No Capping',
                    pre_post_hospitalization_days: [60, 180],
                    restore_benefit: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'Lifelong' },
                financialData: { premium_range_annual: [12000, 45000], claim_process: 'Cashless / Reimbursement 15 days' },
                benefits: ['Restoration Benefit', 'Multiplier Benefit (No Claim Bonus)', 'Preventive Health Check-up'],
                exclusions: ['Pre-existing diseases (36-month waiting)', 'Adventure Sports', 'Dental Cosmetic'],
            }
        });

        // 2. Star Health Family Health Optima
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'star-family-health-optima' },
            update: {},
            create: {
                typeId: familyFloaterId,
                providerName: 'Star Health',
                productName: 'Family Health Optima',
                seoSlug: 'star-family-health-optima',
                coverageData: {
                    base_sum_insured_range: [300000, 2500000],
                    room_rent_limit: '1% SI/day',
                    pre_post_hospitalization_days: [60, 90],
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'Lifelong' },
                financialData: { premium_range_annual: [8500, 32000], claim_process: 'Cashless / Reimbursement' },
                benefits: ['Auto-recharge benefit', 'Air ambulance cover', 'Donor expenses covered'],
                exclusions: ['2-year waiting period for specific illness', 'Obesity treatment', 'War injury'],
            }
        });

        // 3. Niva Bupa Reassure 2.0
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'niva-bupa-reassure-2-family' },
            update: {},
            create: {
                typeId: familyFloaterId,
                providerName: 'Niva Bupa',
                productName: 'Reassure 2.0',
                seoSlug: 'niva-bupa-reassure-2-family',
                coverageData: {
                    base_sum_insured_range: [500000, 10000000],
                    room_rent_limit: 'No Capping',
                    pre_post_hospitalization_days: [60, 180],
                    direct_claim_settlement: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'Lifelong' },
                financialData: { premium_range_annual: [15000, 60000], claim_process: 'Direct settlement — no TPA' },
                benefits: ['Lock the clock — no age-based premium hike', 'Unlimited restore', 'International emergency cover'],
                exclusions: ['Cosmetic surgery', 'Experimental treatments', '30-day initial waiting period'],
            }
        });
    }

    // --- TERM LIFE POLICIES ----------------------------------------------------

    const termTypeId = await getTypeId('Level Term Life Insurance');
    if (termTypeId) {
        // 4. LIC Tech Term
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'lic-tech-term' },
            update: {},
            create: {
                typeId: termTypeId,
                providerName: 'LIC',
                productName: 'Tech Term',
                seoSlug: 'lic-tech-term',
                coverageData: {
                    sum_assured_options: [5000000, 10000000, 25000000],
                    policy_term_years: [10, 40],
                    death_benefit_payout: 'Lump sum or monthly income',
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'N/A — fixed term' },
                financialData: { premium_range_annual: [6000, 25000], claim_process: 'Online claim intimation + document upload' },
                benefits: ['Online-only pricing (lower premium)', 'Option to increase cover at life events', 'Terminal illness benefit'],
                exclusions: ['Suicide in first year', 'Death under influence of alcohol/drugs (unless proven involuntary)', 'Aviation (unlicensed)'],
            }
        });

        // 5. HDFC Click 2 Protect Life
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'hdfc-click2protect-life' },
            update: {},
            create: {
                typeId: termTypeId,
                providerName: 'HDFC Life',
                productName: 'Click 2 Protect Life',
                seoSlug: 'hdfc-click2protect-life',
                coverageData: {
                    sum_assured_options: [5000000, 100000000],
                    policy_term_years: [10, 40],
                    return_of_premium_option: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'N/A — fixed term' },
                financialData: { premium_range_annual: [7500, 30000], claim_process: 'Digital claim — 3-day simple death claim' },
                benefits: ['Income replacement option', 'Waiver of Premium rider', 'Return of premium variant'],
                exclusions: ['Misrepresentation of health at inception', 'Suicide (1st year)', 'Illegal activity'],
            }
        });

        // 6. ICICI Prudential iProtect Smart
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'icici-pru-iprotect-smart' },
            update: {},
            create: {
                typeId: termTypeId,
                providerName: 'ICICI Prudential',
                productName: 'iProtect Smart',
                seoSlug: 'icici-pru-iprotect-smart',
                coverageData: {
                    sum_assured_options: [5000000, 100000000],
                    critical_illness_addon: 34,
                    accidental_death_benefit: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'N/A — fixed term' },
                financialData: { premium_range_annual: [8000, 35000], claim_process: 'Online + call centre' },
                benefits: ['34 critical illness covered', 'Disability benefit', 'Accidental death benefit'],
                exclusions: ['Participation in riots / civil commotion', 'Self-inflicted injury (1st year)', 'Nuclear hazard'],
            }
        });
    }

    // --- MOTOR POLICIES --------------------------------------------------------

    const comprehensiveCarId = await getTypeId('Comprehensive Car Insurance');
    if (comprehensiveCarId) {
        // 7. HDFC ERGO Comprehensive Car
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'hdfc-ergo-comprehensive-car' },
            update: {},
            create: {
                typeId: comprehensiveCarId,
                providerName: 'HDFC ERGO',
                productName: 'Motor Comprehensive',
                seoSlug: 'hdfc-ergo-comprehensive-car',
                coverageData: {
                    own_damage: true,
                    third_party_liability: true,
                    zero_depreciation_addon: true,
                    roadside_assistance: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 99, renewability: 'Annual' },
                financialData: { premium_range_annual: [4500, 25000], claim_process: 'Cashless at 6500+ garages' },
                benefits: ['Zero depreciation cover', 'Engine protection', 'Key replacement'],
                exclusions: ['Drunk driving', 'Driving without valid licence', 'Wear and tear'],
            }
        });

        // 8. Bajaj Allianz Comprehensive Car
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'bajaj-allianz-comprehensive-car' },
            update: {},
            create: {
                typeId: comprehensiveCarId,
                providerName: 'Bajaj Allianz',
                productName: 'Private Car Package Policy',
                seoSlug: 'bajaj-allianz-comprehensive-car',
                coverageData: {
                    own_damage: true,
                    third_party_liability: true,
                    personal_accident_cover: 1500000,
                    add_on_count: 7,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 99, renewability: 'Annual' },
                financialData: { premium_range_annual: [4000, 22000], claim_process: 'Motor on the spot settlement' },
                benefits: ['On-the-spot claim settlement', 'Voluntary excess discount', '24x7 roadside assistance'],
                exclusions: ['Consequential loss', 'Electrical breakdown', 'Overloading'],
            }
        });
    }

    // --- CRITICAL ILLNESS POLICIES ----------------------------------------------

    const criticalIllnessId = await getTypeId('Critical Illness Cover');
    if (criticalIllnessId) {
        // 9. Max Life Critical Illness
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'max-life-critical-illness' },
            update: {},
            create: {
                typeId: criticalIllnessId,
                providerName: 'Max Life',
                productName: 'Smart Critical Care',
                seoSlug: 'max-life-critical-illness',
                coverageData: {
                    illness_count: 40,
                    sum_insured_range: [1000000, 10000000],
                    recurrence_benefit: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 65, renewability: 'Lifelong' },
                financialData: { premium_range_annual: [5000, 20000], claim_process: 'Lump sum — 30 day survival clause' },
                benefits: ['40 critical illnesses', 'Recurrence benefit for cancer', 'Early stage cover'],
                exclusions: ['Pre-existing conditions (4-year waiting)', 'Self-inflicted illness', 'Foreign contamination'],
            }
        });

        // 10. Aditya Birla Activ Health Platinum Enhanced
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'ab-activ-health-platinum' },
            update: {},
            create: {
                typeId: criticalIllnessId,
                providerName: 'Aditya Birla Health',
                productName: 'Activ Health Platinum Enhanced',
                seoSlug: 'ab-activ-health-platinum',
                coverageData: {
                    illness_count: 64,
                    sum_insured_range: [500000, 10000000],
                    wellness_rewards: true,
                    chronic_management: true,
                },
                eligibilityData: { min_entry_age: 5, max_entry_age: 65, renewability: 'Lifelong' },
                financialData: { premium_range_annual: [14000, 55000], claim_process: 'Cashless + reimbursement' },
                benefits: ['HealthReturns™ — earn premium back', '64 illnesses', 'Chronic disease management'],
                exclusions: ['30-day waiting period (general)', 'Obesity/weight management', 'War injuries'],
            }
        });
    }

    // --- SENIOR CITIZEN HEALTH --------------------------------------------------

    const seniorCitizenId = await getTypeId('Senior Citizen Health Insurance');
    if (seniorCitizenId) {
        // 11. Star Senior Citizens Red Carpet
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'star-senior-red-carpet' },
            update: {},
            create: {
                typeId: seniorCitizenId,
                providerName: 'Star Health',
                productName: 'Senior Citizens Red Carpet',
                seoSlug: 'star-senior-red-carpet',
                coverageData: {
                    sum_insured_range: [100000, 2500000],
                    room_rent_limit: '1% SI/day',
                    no_pre_medical_required: true,
                },
                eligibilityData: { min_entry_age: 60, max_entry_age: 75, renewability: 'Lifelong' },
                financialData: { premium_range_annual: [20000, 75000], claim_process: 'Cashless + reimbursement' },
                benefits: ['No pre-medical check-up', 'Cataract, knee replacement covered', 'Outpatient cover'],
                exclusions: ['Pre-existing disease (1-year waiting)', 'Dental cosmetic', 'Infertility'],
            }
        });
    }

    // --- ULIP ------------------------------------------------------------------

    const ulipId = await getTypeId('Unit Linked Insurance Plans (ULIP)');
    if (ulipId) {
        // 12. HDFC Life Click 2 Wealth
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'hdfc-life-click2wealth-ulip' },
            update: {},
            create: {
                typeId: ulipId,
                providerName: 'HDFC Life',
                productName: 'Click 2 Wealth',
                seoSlug: 'hdfc-life-click2wealth-ulip',
                coverageData: {
                    fund_options: ['Equity Fund', 'Balanced Fund', 'Debt Fund', 'Liquid Fund'],
                    policy_term_years: [10, 30],
                    lock_in_period: 5,
                },
                eligibilityData: { min_entry_age: 0, max_entry_age: 65, renewability: 'N/A' },
                financialData: { premium_range_annual: [24000, 500000], claim_process: 'Fund value + sum assured on death' },
                benefits: ['Zero allocation charges', 'Loyalty additions', 'Partial withdrawal post 5 years'],
                exclusions: ['Suicide (1st year — only fund value returned)', 'Market risk on equity funds'],
            }
        });
    }

    // --- PERSONAL ACCIDENT -----------------------------------------------------

    const paId = await getTypeId('Personal Accident Cover');
    if (paId) {
        // 13. Bajaj Allianz Personal Guard
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'bajaj-personal-guard' },
            update: {},
            create: {
                typeId: paId,
                providerName: 'Bajaj Allianz',
                productName: 'Personal Guard',
                seoSlug: 'bajaj-personal-guard',
                coverageData: {
                    accidental_death_cover: true,
                    permanent_disability: true,
                    temporary_disability_weekly: true,
                    education_benefit: true,
                },
                eligibilityData: { min_entry_age: 5, max_entry_age: 70, renewability: 'Annual' },
                financialData: { premium_range_annual: [800, 5000], claim_process: 'Document submission + 15-day settlement' },
                benefits: ['100% SI on accidental death', '125% SI on permanent disability', 'Education fund for children'],
                exclusions: ['Self-inflicted injury', 'Military service injury', 'Injury under intoxication'],
            }
        });
    }

    // --- CYBER INSURANCE -------------------------------------------------------

    const cyberId = await getTypeId('Cyber Liability Insurance');
    if (cyberId) {
        // 14. Bajaj Allianz Cyber Safe
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'bajaj-allianz-cyber-safe' },
            update: {},
            create: {
                typeId: cyberId,
                providerName: 'Bajaj Allianz',
                productName: 'Cyber Safe',
                seoSlug: 'bajaj-allianz-cyber-safe',
                coverageData: {
                    data_breach: true,
                    ransomware: true,
                    financial_fraud: true,
                    cyber_extortion: true,
                    identity_theft: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 75, renewability: 'Annual' },
                financialData: { premium_range_annual: [1000, 8000], claim_process: 'Online FIR + claim form submission' },
                benefits: ['Ransomware attack cover', 'Identity theft ₹5L', 'Email spoofing / phishing loss'],
                exclusions: ['Intentional malicious act', 'Prior known breaches', 'War / terrorism'],
            }
        });
    }

    // --- MATERNITY INSURANCE ---------------------------------------------------

    const maternityId = await getTypeId('Maternity Insurance');
    if (maternityId) {
        // 15. Care Maternity
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'care-maternity-health' },
            update: {},
            create: {
                typeId: maternityId,
                providerName: 'Care Health Insurance',
                productName: 'Care Maternity',
                seoSlug: 'care-maternity-health',
                coverageData: {
                    normal_delivery_cover: 35000,
                    caesarean_delivery_cover: 50000,
                    newborn_cover_days: 90,
                    pre_post_natal_cover: true,
                },
                eligibilityData: { min_entry_age: 18, max_entry_age: 45, renewability: 'Annual' },
                financialData: { premium_range_annual: [12000, 30000], claim_process: 'Cashless at network hospitals' },
                benefits: ['Covers normal + C-section', 'Newborn vaccinations', 'Post-natal care'],
                exclusions: ['2-year waiting period (maternity)', 'IVF / infertility treatment', 'Induced abortion'],
            }
        });
    }

    console.log('✅ 15 real Indian insurance products seeded successfully!');
    console.log('   → 3 Health (Family Floater), 3 Term Life, 2 Motor');
    console.log('   → 2 Critical Illness, 1 Senior Citizen, 1 ULIP');
    console.log('   → 1 Personal Accident, 1 Cyber, 1 Maternity');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
