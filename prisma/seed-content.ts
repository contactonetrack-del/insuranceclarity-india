import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const claimCases = [
    // === LIFE INSURANCE REJECTIONS ===
    { category: 'life', title: 'Term Life Claim Rejected - Hidden Diabetes', status: 'rejected', amount: 5000000, issue: 'Policyholder did not disclose Type 2 diabetes during application. Investigation revealed regular insulin purchases 2 years before policy.', outcome: 'Rejected base sum. Claim denied due to material non-disclosure.', lesson: 'Insurers check pharmacy records, hospital databases. Always disclose ALL conditions.', details: 'Full details here.' },
    { category: 'life', title: 'Death Claim Rejected - Suicide Within 1 Year', status: 'rejected', amount: 10000000, issue: 'Policyholder died by suicide 8 months after buying policy. Suicide clause applies for first 12-24 months.', outcome: 'Rejected base sum. Family received only premium refund.', lesson: 'Suicide exclusion is standard. Family received only premium refund.', details: 'Full details here.' },
    { category: 'life', title: 'Claim Rejected - Smoker Declared as Non-Smoker', status: 'rejected', amount: 7500000, issue: 'Lung cancer death. Autopsy showed long-term smoking. Policy was issued at non-smoker rates.', outcome: 'Rejected total payout.', lesson: 'Medical tests can reveal smoking history. Declare honestly and pay correct premium.', details: 'Full details here.' },
    { category: 'life', title: 'Policy Lapsed - Death During Grace Period Dispute', status: 'rejected', amount: 2500000, issue: 'Premium due March 1, death on March 20. Insurer claimed grace period ended March 15. Family disputes.', outcome: 'Rejected payout.', lesson: 'Set up auto-debit. Never let policy lapse. Know exact grace period dates.', details: 'Full details here.' },
    { category: 'life', title: 'ULIP Claim Approved - Clean Disclosure', status: 'approved', amount: 4000000, issue: 'Heart attack after 6 years of policy. All medical history was disclosed at purchase. Smooth settlement.', outcome: 'Approved full sum.', lesson: 'Honest disclosure = hassle-free claims. Time since issuance also helps.', details: 'Full details here.' },

    // === HEALTH INSURANCE REJECTIONS ===
    { category: 'health', title: 'Knee Replacement Rejected - Pre-existing Arthritis', status: 'rejected', amount: 450000, issue: 'Policy bought in 2024, surgery in 2025. MRI showed 10-year degenerative changes. Pre-existing condition.', outcome: 'Rejected surgical cost.', lesson: 'Degenerative conditions are detectable. Wait 4 years or disclose upfront.', details: 'Full details here.' },
    { category: 'health', title: 'Heart Surgery Partial - Room Rent Capping Applied', status: 'partial', amount: 650000, issue: 'Chose ₹12,000/day room, policy limit was ₹4,000. Entire bill reduced proportionally (33%).', outcome: 'Paid ₹280000 of ₹650000.', lesson: 'Room rent affects EVERYTHING - surgeon fees, nursing, all proportionally cut.', details: 'Full details here.' },
    { category: 'health', title: 'Dialysis Rejected - Within Waiting Period', status: 'rejected', amount: 200000, issue: 'Kidney failure 18 months after policy. Renal conditions have 24-48 month waiting period.', outcome: 'Denied.', lesson: 'Know specific disease waiting periods. Kidney, cancer, heart = longer waits.', details: 'Full details here.' },
    { category: 'health', title: 'Maternity Claim Rejected - Bought During Pregnancy', status: 'rejected', amount: 120000, issue: 'Policy bought in 3rd month of pregnancy. C-section in 7th month. Maternity has 9-month to 3-year wait.', outcome: 'Denied.', lesson: 'Buy health insurance BEFORE planning pregnancy. Minimum 9 months wait.', details: 'Full details here.' },
    { category: 'health', title: 'Dental Surgery Rejected - Not Accident Related', status: 'rejected', amount: 80000, issue: 'Root canal and implants claimed. Denied as dental is excluded unless accident-related.', outcome: 'Denied.', lesson: 'Dental coverage needs specific add-on. Standard health excludes dental.', details: 'Full details here.' },
    { category: 'health', title: 'Cataract Surgery Partial - Sub-limit Applied', status: 'partial', amount: 75000, issue: '₹5L policy but cataract sub-limit of ₹25K per eye. Premium lens and advanced procedure not covered.', outcome: 'Paid ₹25K.', lesson: 'Check disease-wise sub-limits. Cataract, hernia, piles often capped.', details: 'Full details here.' },
    { category: 'health', title: 'COVID Home Treatment Rejected', status: 'rejected', amount: 150000, issue: 'Treated at home with oxygen concentrator. Hospital beds were available. Domiciliary needs unavailability proof.', outcome: 'Denied.', lesson: 'Home treatment covered ONLY if hospitalization is medically impossible.', details: 'Full details here.' },
    { category: 'health', title: 'Physiotherapy Rejected - OPD Excluded', status: 'rejected', amount: 60000, issue: '6 months of post-surgery physiotherapy claimed. OPD treatments not covered in standard policy.', outcome: 'Denied.', lesson: 'Buy OPD add-on if you expect regular non-hospitalization treatments.', details: 'Full details here.' },

    // === MOTOR INSURANCE REJECTIONS ===
    { category: 'motor', title: 'Total Loss Claim Rejected - Drunk Driving', status: 'rejected', amount: 1200000, issue: 'Luxury car total loss. Police report showed 120mg/100ml blood alcohol (limit: 30). Zero payout.', outcome: 'Denied totally.', lesson: 'Drunk driving = automatic rejection. No exceptions ever.', details: 'Full details here.' },
    { category: 'motor', title: 'Engine Damage Rejected - Started in Flood', status: 'rejected', amount: 350000, issue: 'Car stalled in waterlogged road. Owner tried starting multiple times. Hydrostatic lock damage.', outcome: 'Denied.', lesson: 'NEVER start car in water. Buy Engine Protect add-on. Wait for tow truck.', details: 'Full details here.' },
    { category: 'motor', title: 'Claim Rejected - Son Had Learner License', status: 'rejected', amount: 800000, issue: '18-year-old son crashed father\'s car. Had learner license, driving alone without L-board.', outcome: 'Denied.', lesson: 'Learner must have licensed driver alongside. Invalid license = no claim.', details: 'Full details here.' },
    { category: 'motor', title: 'Theft Claim Reduced - Low IDV Selected', status: 'partial', amount: 700000, issue: 'Chose minimum IDV (₹4L) to save premium. Car worth ₹7L stolen. Maximum payout was IDV.', outcome: 'Paid ₹400000.', lesson: 'IDV is your maximum payout. Don\'t underinsure to save ₹2000 premium.', details: 'Full details here.' },
    { category: 'motor', title: 'Commercial Use Rejection - Ola Driver', status: 'rejected', amount: 500000, issue: 'Private car insurance. Accident while doing Ola ride. Commercial use voids private policy.', outcome: 'Denied.', lesson: 'Ola/Uber drivers MUST have commercial vehicle insurance, not private.', details: 'Full details here.' },
    { category: 'motor', title: 'Claim Reduced - Depreciation Applied', status: 'partial', amount: 200000, issue: 'Bumper, headlights, tyres replaced. 50% depreciation on rubber/plastic. Only metal at full value.', outcome: 'Paid ₹120000.', lesson: 'Buy Zero Depreciation add-on. Standard policy has heavy depreciation cuts.', details: 'Full details here.' },
    { category: 'motor', title: 'CNG Kit Fire Rejected - Not Declared', status: 'rejected', amount: 250000, issue: 'Aftermarket CNG kit caught fire. Kit not endorsed in insurance. Entire fire damage rejected.', outcome: 'Denied.', lesson: 'All modifications must be declared and endorsed. CNG needs separate cover.', details: 'Full details here.' },

    // === TRAVEL INSURANCE REJECTIONS ===
    { category: 'travel', title: 'Medical Emergency Rejected - Pre-existing Heart', status: 'rejected', amount: 3700000, issue: 'Heart attack in USA. History of hypertension and cholesterol. Pre-existing exclusion applied.', outcome: 'Denied.', lesson: 'Declare all conditions. Some insurers offer pre-existing cover for extra premium.', details: 'Full details here.' },
    { category: 'travel', title: 'Skiing Injury Rejected - Adventure Exclusion', status: 'rejected', amount: 2200000, issue: 'Broken leg while skiing in Switzerland. Standard policy excludes adventure sports.', outcome: 'Denied.', lesson: 'Buy Adventure Sports add-on before skiing, scuba, paragliding, etc.', details: 'Full details here.' },
    { category: 'travel', title: 'Baggage Claim Partial - Sub-limit Per Item', status: 'partial', amount: 250000, issue: 'Lost bag had ₹2.5L camera. Per-item limit was $500. Only received fraction of value.', outcome: 'Paid ₹42000 (approx 500 dollars).', lesson: 'Expensive items need separate valuable items cover. Check per-item limits.', details: 'Full details here.' },
    { category: 'travel', title: 'Trip Cancellation Rejected - Work Reason', status: 'rejected', amount: 180000, issue: 'Boss called urgent meeting, had to cancel Europe trip. Work reasons not covered.', outcome: 'Denied.', lesson: 'Only illness, death, serious emergencies covered. Read cancellation terms.', details: 'Full details here.' },

    // === HOME INSURANCE REJECTIONS ===
    { category: 'home', title: 'Flood Damage Rejected - No Add-on', status: 'rejected', amount: 800000, issue: 'Ground floor flooded in Mumbai rains. Standard fire policy doesn\'t cover flood.', outcome: 'Denied.', lesson: 'Flood, earthquake, terrorism need separate add-ons in India.', details: 'Full details here.' },
    { category: 'home', title: 'Theft Rejected - No Forced Entry', status: 'rejected', amount: 350000, issue: 'Servant stole jewelry. No signs of break-in. Policy requires forcible entry proof.', outcome: 'Denied.', lesson: 'Theft without forced entry requires fidelity/domestic help cover.', details: 'Full details here.' },
    { category: 'home', title: 'Gold Theft Partial - Sub-limit Applied', status: 'partial', amount: 500000, issue: 'Burglary with ₹5L gold stolen. Jewelry sub-limit was ₹1L in home contents policy.', outcome: 'Paid ₹100000.', lesson: 'Declare valuables separately. Gold/jewelry have very low default limits.', details: 'Full details here.' },
    { category: 'home', title: 'Water Damage Rejected - Gradual Leak', status: 'rejected', amount: 200000, issue: 'Bathroom leak damaged bedroom over months. Gradual seepage not covered, only sudden.', outcome: 'Denied.', lesson: 'Maintain home regularly. Only sudden/accidental damage covered.', details: 'Full details here.' },

    // === APPROVED CASES (for balance) ===
    { category: 'health', title: 'Bypass Surgery Approved - After Waiting Period', status: 'approved', amount: 1200000, issue: 'Heart bypass in year 5 of policy. No pre-existing heart issues. Smooth cashless claim.', outcome: 'Approved', lesson: 'Long-term policies with clean history = smooth claims.', details: 'Full details here.' },
    { category: 'motor', title: 'Total Loss Approved - Proper Process', status: 'approved', amount: 950000, issue: 'Car totaled in highway accident. FIR filed, surveyor visit, all documents submitted. Paid IDV.', outcome: 'Paid full IDV.', lesson: 'Choose realistic IDV, file FIR immediately, follow insurer process.', details: 'Full details here.' }
];

const hiddenFactsData = {
    life: {
        category: "life",
        facts: [
            { title: "Suicide Clause", severity: "critical", description: "Most policies don't pay if death occurs by suicide within the first 1-2 years.", affectedPolicies: ["Term Life", "Whole Life", "ULIPs", "Endowment"], whatToCheck: "Look for 'Suicide Exclusion' in the policy document", realCase: "A 2019 case where claim was rejected for suicide in month 14, but paid after appeal." },
            { title: "Material Non-Disclosure", severity: "critical", description: "Not revealing pre-existing conditions, smoking or drinking habits can void the entire policy.", affectedPolicies: ["All Life Insurance"], whatToCheck: "Answer ALL health questions truthfully in the proposal form", realCase: "Claim rejected: Policyholder hid diabetes history. Family received ZERO." }
        ]
    },
    health: {
        category: "health",
        facts: [
            { title: "Pre-existing Disease Waiting Period", severity: "critical", description: "Diseases you have BEFORE buying policy are not covered for up to 2 years (max 24 months per IRDAI 2026 norms).", affectedPolicies: ["All Health Insurance"], whatToCheck: "Check 'Pre-existing Disease Clause' and waiting period duration", realCase: "Diabetic patient's dialysis claim rejected - diabetes was pre-existing, 2-year wait applied." },
            { title: "Room Rent Capping", severity: "high", description: "If you take a room more expensive than your limit, ALL expenses are reduced proportionally.", affectedPolicies: ["Individual Health", "Family Floater"], whatToCheck: "Check 'Room Rent Sub-limit' - aim for 'No Sub-limit' policies", realCase: "₹5L policy, took ₹8K room (limit ₹4K). ₹3L bill paid only ₹1.5L." }
        ]
    },
    motor: {
        category: "motor",
        facts: [
            { title: "Valid Driving License", severity: "critical", description: "If driver doesn't have valid license for vehicle type, claim is rejected entirely.", affectedPolicies: ["All Motor Insurance"], whatToCheck: "Ensure all family members driving have valid license for vehicle category", realCase: "Son driving with learner's license. Accident claim rejected entirely." }
        ]
    },
    travel: {
        category: "travel",
        facts: [
            { title: "Adventure Sports Exclusion", severity: "high", description: "Injuries during adventure activities are NOT covered unless you buy add-on.", affectedPolicies: ["All Travel Insurance"], whatToCheck: "If planning adventure activities, buy 'Adventure Sports Cover' add-on", realCase: "Skiing injury in Switzerland cost €15,000. Claim rejected." }
        ]
    },
    home: {
        category: "home",
        facts: [
            { title: "Underinsurance Penalty", severity: "critical", description: "If you insure house for less than actual value, payout is proportionally reduced.", affectedPolicies: ["Building Insurance"], whatToCheck: "Ensure sum insured reflects replacement cost, not market value", realCase: "₹50L house insured for ₹30L. ₹10L damage claim paid only ₹6L." }
        ]
    },
    business: {
        category: "business",
        facts: [
            { title: "Professional Indemnity Waiting Period", severity: "high", description: "PI insurance often has 'claims made' basis - only claims made during policy period are covered.", affectedPolicies: ["Professional Indemnity", "E&O Insurance"], whatToCheck: "Understand 'Claims Made vs Occurrence' basis. Maintain continuous coverage.", realCase: "Consultant's error in 2024, client sued in 2026. Policy lapsed. No coverage." }
        ]
    },
    specialized: {
        category: "specialized",
        facts: [
            { title: "Pet Insurance Age Limits", severity: "high", description: "Most pet insurance policies won't cover dogs/cats above 8 years.", affectedPolicies: ["Pet Insurance"], whatToCheck: "Check entry age limit and renewal age limit separately", realCase: "10-year-old Labrador needed surgery. Policy had expired at age 8." }
        ]
    },
    personalAccident: {
        category: "personalAccident",
        facts: [
            { title: "Self-Inflicted Injury Exclusion", severity: "critical", description: "All PA policies exclude self-inflicted injuries. Suicide is never covered.", affectedPolicies: ["Personal Accident Insurance"], whatToCheck: "Self-harm exclusion applies regardless of mental state", realCase: "Death ruled self-inflicted. PA claim rejected entirely." }
        ]
    }
};

async function main() {
    console.log('Seeding Hidden Facts and Claim Cases...');

    for (const data of Object.values(hiddenFactsData)) {
        for (const fact of data.facts) {
            await prisma.hiddenFact.create({
                data: {
                    category: data.category,
                    title: fact.title,
                    severity: fact.severity,
                    description: fact.description,
                    affectedPolicies: fact.affectedPolicies,
                    whatToCheck: fact.whatToCheck,
                    realCase: fact.realCase,
                    example: null
                }
            });
        }
    }

    for (const c of claimCases) {
        await prisma.claimCase.create({
            data: {
                category: c.category,
                title: c.title,
                status: c.status,
                amount: c.amount,
                issue: c.issue,
                details: c.details,
                outcome: c.outcome,
                lesson: c.lesson
            }
        });
    }

    console.log('Finished seeding Content data.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
