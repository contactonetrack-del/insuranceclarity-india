import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const claimCases = [
    { category: 'life', title: 'Term Life Claim Rejected - Hidden Diabetes', status: 'rejected', amount: 5000000, issue: 'Policyholder did not disclose Type 2 diabetes during application. Investigation revealed regular insulin purchases 2 years before policy.', outcome: 'Rejected base sum. Claim denied due to material non-disclosure.', lesson: 'Insurers check pharmacy records and hospital databases. Always disclose all conditions.', details: 'Full details here.' },
    { category: 'life', title: 'Death Claim Rejected - Suicide Within 1 Year', status: 'rejected', amount: 10000000, issue: 'Policyholder died by suicide 8 months after buying policy. Suicide clause applies for the first 12-24 months.', outcome: 'Rejected base sum. Family received only premium refund.', lesson: 'Suicide exclusion is standard. Families often receive only a premium refund.', details: 'Full details here.' },
    { category: 'life', title: 'Claim Rejected - Smoker Declared as Non-Smoker', status: 'rejected', amount: 7500000, issue: 'Lung cancer death. Autopsy showed long-term smoking. Policy was issued at non-smoker rates.', outcome: 'Rejected total payout.', lesson: 'Medical tests can reveal smoking history. Declare honestly and pay the correct premium.', details: 'Full details here.' },
    { category: 'life', title: 'Policy Lapsed - Death During Grace Period Dispute', status: 'rejected', amount: 2500000, issue: 'Premium due March 1, death on March 20. Insurer claimed grace period ended March 15. Family disputes.', outcome: 'Rejected payout.', lesson: 'Set up auto-debit. Never let a policy lapse. Know exact grace period dates.', details: 'Full details here.' },
    { category: 'life', title: 'ULIP Claim Approved - Clean Disclosure', status: 'approved', amount: 4000000, issue: 'Heart attack after 6 years of policy. All medical history was disclosed at purchase. Smooth settlement.', outcome: 'Approved full sum.', lesson: 'Honest disclosure leads to smoother claims. Time since issuance also helps.', details: 'Full details here.' },
    { category: 'health', title: 'Knee Replacement Rejected - Pre-existing Arthritis', status: 'rejected', amount: 450000, issue: 'Policy bought in 2024, surgery in 2025. MRI showed 10-year degenerative changes. Pre-existing condition.', outcome: 'Rejected surgical cost.', lesson: 'Degenerative conditions are detectable. Wait out the waiting period or disclose upfront.', details: 'Full details here.' },
    { category: 'health', title: 'Heart Surgery Partial - Room Rent Capping Applied', status: 'partial', amount: 650000, issue: 'Chose a room above the policy limit, so the bill was reduced proportionally.', outcome: 'Partial payout.', lesson: 'Room rent affects the entire bill. Choose plans without sub-limits when possible.', details: 'Full details here.' },
    { category: 'health', title: 'Dialysis Rejected - Within Waiting Period', status: 'rejected', amount: 200000, issue: 'Kidney failure 18 months after policy. Renal conditions had a 24-48 month waiting period.', outcome: 'Denied.', lesson: 'Know disease-specific waiting periods. Kidney, cancer, and heart conditions often have longer waits.', details: 'Full details here.' },
    { category: 'health', title: 'Maternity Claim Rejected - Bought During Pregnancy', status: 'rejected', amount: 120000, issue: 'Policy bought in the third month of pregnancy. Delivery happened inside the maternity waiting window.', outcome: 'Denied.', lesson: 'Buy health insurance before planning pregnancy. Maternity cover almost always has a waiting period.', details: 'Full details here.' },
    { category: 'health', title: 'Dental Surgery Rejected - Not Accident Related', status: 'rejected', amount: 80000, issue: 'Root canal and implants claimed. Denied because standard health cover excludes dental unless accident-related.', outcome: 'Denied.', lesson: 'Dental coverage usually requires a specific add-on. Standard health plans exclude it.', details: 'Full details here.' },
    { category: 'health', title: 'Cataract Surgery Partial - Sub-limit Applied', status: 'partial', amount: 75000, issue: 'The cataract sub-limit capped the insurer contribution despite a larger policy sum insured.', outcome: 'Partial payout.', lesson: 'Check disease-wise sub-limits. Cataract, hernia, and piles are often capped.', details: 'Full details here.' },
    { category: 'health', title: 'COVID Home Treatment Rejected', status: 'rejected', amount: 150000, issue: 'Treated at home with oxygen concentrator while hospital beds were available.', outcome: 'Denied.', lesson: 'Home treatment is covered only if hospitalization is medically impossible or unavailable.', details: 'Full details here.' },
    { category: 'health', title: 'Physiotherapy Rejected - OPD Excluded', status: 'rejected', amount: 60000, issue: 'Six months of post-surgery physiotherapy claimed under a standard hospitalization policy.', outcome: 'Denied.', lesson: 'Buy an OPD add-on if you expect regular non-hospitalization treatments.', details: 'Full details here.' },
    { category: 'motor', title: 'Total Loss Claim Rejected - Drunk Driving', status: 'rejected', amount: 1200000, issue: 'Police report showed blood alcohol above the legal limit.', outcome: 'Denied totally.', lesson: 'Drunk driving triggers automatic rejection. No exceptions.', details: 'Full details here.' },
    { category: 'motor', title: 'Engine Damage Rejected - Started in Flood', status: 'rejected', amount: 350000, issue: 'Car stalled in waterlogged road. Owner repeatedly tried to restart it, causing hydrostatic lock.', outcome: 'Denied.', lesson: 'Never restart a flooded car. Buy engine protect if you need this risk covered.', details: 'Full details here.' },
    { category: 'motor', title: 'Claim Rejected - Son Had Learner License', status: 'rejected', amount: 800000, issue: 'Learner drove alone without the required supervision and markings.', outcome: 'Denied.', lesson: 'Invalid licence conditions void the claim.', details: 'Full details here.' },
    { category: 'motor', title: 'Theft Claim Reduced - Low IDV Selected', status: 'partial', amount: 700000, issue: 'Vehicle was insured for a lower IDV than its realistic market value.', outcome: 'Paid only up to IDV.', lesson: 'IDV is the maximum payout. Underinsuring to save premium backfires.', details: 'Full details here.' },
    { category: 'motor', title: 'Commercial Use Rejection - Ola Driver', status: 'rejected', amount: 500000, issue: 'Private car insurance was used while driving commercially.', outcome: 'Denied.', lesson: 'Ride-hailing use needs commercial vehicle insurance, not private cover.', details: 'Full details here.' },
    { category: 'motor', title: 'Claim Reduced - Depreciation Applied', status: 'partial', amount: 200000, issue: 'Rubber and plastic parts were subject to standard depreciation.', outcome: 'Partial payout.', lesson: 'Buy zero-depreciation add-on if you want full-value parts replacement.', details: 'Full details here.' },
    { category: 'motor', title: 'CNG Kit Fire Rejected - Not Declared', status: 'rejected', amount: 250000, issue: 'Aftermarket CNG kit was not endorsed in the policy.', outcome: 'Denied.', lesson: 'Declare all modifications. Fuel kit changes need specific endorsement.', details: 'Full details here.' },
    { category: 'travel', title: 'Medical Emergency Rejected - Pre-existing Heart', status: 'rejected', amount: 3700000, issue: 'Heart attack during travel with undisclosed pre-existing cardiac risk.', outcome: 'Denied.', lesson: 'Declare pre-existing conditions. Some plans cover them for extra premium.', details: 'Full details here.' },
    { category: 'travel', title: 'Skiing Injury Rejected - Adventure Exclusion', status: 'rejected', amount: 2200000, issue: 'Standard travel cover excluded adventure sports injuries.', outcome: 'Denied.', lesson: 'Buy an adventure sports add-on before skiing, scuba, or similar activities.', details: 'Full details here.' },
    { category: 'travel', title: 'Baggage Claim Partial - Sub-limit Per Item', status: 'partial', amount: 250000, issue: 'A high-value camera exceeded the per-item baggage limit.', outcome: 'Partial payout.', lesson: 'Expensive items need separate valuables cover. Check per-item limits.', details: 'Full details here.' },
    { category: 'travel', title: 'Trip Cancellation Rejected - Work Reason', status: 'rejected', amount: 180000, issue: 'Trip was cancelled for work reasons, which the policy did not cover.', outcome: 'Denied.', lesson: 'Cancellation cover is usually limited to illness, death, or serious emergencies.', details: 'Full details here.' },
    { category: 'home', title: 'Flood Damage Rejected - No Add-on', status: 'rejected', amount: 800000, issue: 'Standard fire policy did not include flood add-on cover.', outcome: 'Denied.', lesson: 'Flood, earthquake, and terrorism usually need specific add-ons.', details: 'Full details here.' },
    { category: 'home', title: 'Theft Rejected - No Forced Entry', status: 'rejected', amount: 350000, issue: 'Jewelry was stolen without signs of forcible entry.', outcome: 'Denied.', lesson: 'Theft without forced entry often needs domestic help or fidelity cover.', details: 'Full details here.' },
    { category: 'home', title: 'Gold Theft Partial - Sub-limit Applied', status: 'partial', amount: 500000, issue: 'Jewelry theft exceeded the standard valuables sub-limit.', outcome: 'Partial payout.', lesson: 'Declare gold and jewelry separately. Default limits are usually low.', details: 'Full details here.' },
    { category: 'home', title: 'Water Damage Rejected - Gradual Leak', status: 'rejected', amount: 200000, issue: 'Long-running seepage damaged the property.', outcome: 'Denied.', lesson: 'Most home cover responds to sudden accidental damage, not gradual deterioration.', details: 'Full details here.' },
    { category: 'health', title: 'Bypass Surgery Approved - After Waiting Period', status: 'approved', amount: 1200000, issue: 'Bypass surgery in year five of the policy, with no prior undisclosed cardiac history.', outcome: 'Approved.', lesson: 'Long-standing policies with clean disclosures tend to settle smoothly.', details: 'Full details here.' },
    { category: 'motor', title: 'Total Loss Approved - Proper Process', status: 'approved', amount: 950000, issue: 'Vehicle total loss with FIR, surveyor visit, and full document trail completed correctly.', outcome: 'Paid full IDV.', lesson: 'Choose realistic IDV, file an FIR immediately, and follow insurer process strictly.', details: 'Full details here.' },
];

const hiddenFactsData = {
    life: {
        category: 'life',
        facts: [
            { title: 'Suicide Clause', severity: 'critical', description: 'Most policies do not pay if death occurs by suicide within the first 1-2 years.', affectedPolicies: ['Term Life', 'Whole Life', 'ULIPs', 'Endowment'], whatToCheck: "Look for 'Suicide Exclusion' in the policy document", realCase: 'A 2019 case where a claim was rejected for suicide in month 14, but later paid after appeal.' },
            { title: 'Material Non-Disclosure', severity: 'critical', description: 'Not revealing pre-existing conditions, smoking, or drinking habits can void the entire policy.', affectedPolicies: ['All Life Insurance'], whatToCheck: 'Answer all health questions truthfully in the proposal form', realCase: 'Claim rejected after diabetes history surfaced. Family received no payout.' },
        ],
    },
    health: {
        category: 'health',
        facts: [
            { title: 'Pre-existing Disease Waiting Period', severity: 'critical', description: 'Conditions you had before buying the policy are often excluded for up to 24 months under current norms.', affectedPolicies: ['All Health Insurance'], whatToCheck: "Check the pre-existing disease clause and waiting period duration", realCase: 'Dialysis claim rejected because diabetes was pre-existing and the waiting period still applied.' },
            { title: 'Room Rent Capping', severity: 'high', description: 'If you take a room more expensive than your plan allows, many other expenses can be reduced proportionally.', affectedPolicies: ['Individual Health', 'Family Floater'], whatToCheck: "Check the room-rent sub-limit. Prefer policies with 'no sub-limit'.", realCase: 'A large hospitalization bill was halved because the chosen room exceeded the plan limit.' },
        ],
    },
    motor: {
        category: 'motor',
        facts: [
            { title: 'Valid Driving License', severity: 'critical', description: 'If the driver lacks a valid licence for the vehicle type, the claim can be rejected entirely.', affectedPolicies: ['All Motor Insurance'], whatToCheck: 'Ensure everyone driving the vehicle has the correct licence category', realCase: "A son's accident claim was rejected because he was driving on a learner licence without supervision." },
        ],
    },
    travel: {
        category: 'travel',
        facts: [
            { title: 'Adventure Sports Exclusion', severity: 'high', description: 'Travel policies usually exclude injuries during adventure activities unless an add-on is purchased.', affectedPolicies: ['All Travel Insurance'], whatToCheck: "If you plan adventure activities, buy the relevant add-on before travelling", realCase: 'A skiing injury overseas was denied under a standard travel policy.' },
        ],
    },
    home: {
        category: 'home',
        facts: [
            { title: 'Underinsurance Penalty', severity: 'critical', description: 'If the home is insured below replacement cost, payouts are usually reduced proportionally.', affectedPolicies: ['Building Insurance'], whatToCheck: 'Ensure sum insured reflects replacement cost, not market value', realCase: 'A partially insured property received a proportionally reduced damage payout.' },
        ],
    },
    business: {
        category: 'business',
        facts: [
            { title: 'Professional Indemnity Waiting Period', severity: 'high', description: "PI insurance often works on a 'claims made' basis, so the active policy period matters as much as the incident date.", affectedPolicies: ['Professional Indemnity', 'E&O Insurance'], whatToCheck: "Understand 'claims made' versus 'occurrence' cover and maintain continuity", realCase: 'A consultant was sued after the policy lapsed and discovered there was no active claims-made cover.' },
        ],
    },
    specialized: {
        category: 'specialized',
        facts: [
            { title: 'Pet Insurance Age Limits', severity: 'high', description: 'Many pet policies stop accepting new pets above a certain age and may cap renewals as well.', affectedPolicies: ['Pet Insurance'], whatToCheck: 'Check entry age limits and renewal age limits separately', realCase: 'An older pet needed surgery after the insurer age ceiling had already passed.' },
        ],
    },
    personalAccident: {
        category: 'personalAccident',
        facts: [
            { title: 'Self-Inflicted Injury Exclusion', severity: 'critical', description: 'Personal accident insurance excludes self-inflicted injury and suicide.', affectedPolicies: ['Personal Accident Insurance'], whatToCheck: 'Self-harm exclusions apply regardless of policy wording around intent', realCase: 'A death ruled self-inflicted resulted in a full rejection under PA cover.' },
        ],
    },
} as const;

type SeedPrismaClient = Pick<PrismaClient, 'hiddenFact' | 'claimCase'>;

async function upsertHiddenFact(
    prisma: SeedPrismaClient,
    data: {
        category: string;
        title: string;
        severity: string;
        description: string;
        affectedPolicies: string[];
        whatToCheck: string;
        realCase: string;
        example: string | null;
    },
): Promise<void> {
    const existing = await prisma.hiddenFact.findFirst({
        where: {
            category: data.category,
            title: data.title,
        },
        select: { id: true },
    });

    if (existing) {
        await prisma.hiddenFact.update({
            where: { id: existing.id },
            data,
        });
        return;
    }

    await prisma.hiddenFact.create({ data });
}

async function upsertClaimCase(
    prisma: SeedPrismaClient,
    data: {
        category: string;
        title: string;
        status: string;
        amount: number;
        issue: string;
        details: string;
        outcome: string;
        lesson: string;
    },
): Promise<void> {
    const existing = await prisma.claimCase.findFirst({
        where: {
            category: data.category,
            title: data.title,
        },
        select: { id: true },
    });

    if (existing) {
        await prisma.claimCase.update({
            where: { id: existing.id },
            data,
        });
        return;
    }

    await prisma.claimCase.create({ data });
}

export async function seedContentData(prisma: SeedPrismaClient): Promise<void> {
    console.log('Seeding hidden facts and claim cases...');

    for (const data of Object.values(hiddenFactsData)) {
        for (const fact of data.facts) {
            await upsertHiddenFact(prisma, {
                category: data.category,
                title: fact.title,
                severity: fact.severity,
                description: fact.description,
                affectedPolicies: [...fact.affectedPolicies],
                whatToCheck: fact.whatToCheck,
                realCase: fact.realCase,
                example: null,
            });
        }
    }

    for (const claimCase of claimCases) {
        await upsertClaimCase(prisma, claimCase);
    }

    console.log('Finished seeding content data.');
}

async function main(): Promise<void> {
    const prisma = new PrismaClient();

    try {
        await seedContentData(prisma);
    } finally {
        await prisma.$disconnect();
    }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
    void main().catch((error: unknown) => {
        console.error('Content seed failed:', error);
        process.exit(1);
    });
}
