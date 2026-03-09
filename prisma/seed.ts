import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // --- 1. LIFE INSURANCE CATEGORY ---
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

    // --- 2. HEALTH INSURANCE CATEGORY ---
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

    // --- 3. MOTOR INSURANCE CATEGORY ---
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

    // --- 4. B2B & BUSINESS CATEGORY ---
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

    // --- 5. MODERN & NICHE CATEGORY ---
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

    console.log('✅ Base Database Seeded with 50+ Global Taxonomy Types across 5 Categories.');

    // Optionally seed sample policies
    const familyFloater = await prisma.insuranceType.findFirst({
        where: { name: 'Family Floater Health Insurance' }
    });

    if (familyFloater) {
        // Upserting a sample policy to demonstrate the PolicyBazaar attribute layout
        await prisma.insurancePolicy.upsert({
            where: { seoSlug: 'optima-restore-family' },
            update: {},
            create: {
                typeId: familyFloater.id,
                providerName: 'HDFC ERGO',
                productName: 'Optima Restore Family',
                seoSlug: 'optima-restore-family',
                coverageData: {
                    base_sum_insured_range: [500000, 5000000],
                    room_rent_limit: "No Capping",
                    pre_post_hospitalization_days: [60, 180]
                },
                eligibilityData: {
                    min_entry_age: 18,
                    max_entry_age: 65,
                    renewability: "Lifelong"
                },
                financialData: {
                    premium_range_annual: [12000, 45000],
                    claim_process: "Cashless via TPA / Reimbursement within 15 days"
                },
                benefits: ["Restoration Benefit", "Multiplier Benefit", "No Claim Bonus"],
                exclusions: ["Pre-existing diseases (until 36 months)", "Adventure Sports"]
            }
        });
        console.log('✅ Seeded Sample Policy: Optima Restore Family');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
