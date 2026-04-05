import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const cases = [
        {
            category: "Health Insurance",
            title: "Heart Surgery Proportional Deduction",
            status: "Partial",
            amount: 450000,
            issue: "Claim reduced because of Room Rent Capping.",
            details: "User stayed in a Luxury Suite (12k/day) while policy allowed only 5k/day. Insurer applied 50% deduction on all surgery costs.",
            outcome: "Ombudsman ruled in favor of consumer for non-medical items but upheld proportional deduction for surgeon fees.",
            lesson: "Always pick a room within policy limits to avoid 'hidden' deductions on the entire bill."
        },
        {
            category: "Life Insurance",
            title: "Non-Disclosure of Smoking Habit",
            status: "Rejected",
            amount: 15000000,
            issue: "Claim rejected due to 2-year old smoking history not mentioned at time of purchase.",
            details: "Policyholder died of cardiac arrest. Investigation found medical reports of nicotine therapy from 3 years ago.",
            outcome: "Upheld by IRDAI. Material non-disclosure is vaild ground for rejection.",
            lesson: "Be 100% honest about tobacco and pre-existing diseases, even if it increases premium."
        },
        {
            category: "Motor Insurance",
            title: "Engine Protection cover requirement",
            status: "Rejected",
            amount: 120000,
            issue: "Hydrostatic lock due to driving in flooded area.",
            details: "Car was driven through 2 feet of water. Engine seized. Claim was rejected as 'consequential damage'.",
            outcome: "Rejected by many consumer courts as the damage happened due to user attempting to crank the engine in water.",
            lesson: "Get an 'Engine Protect' add-on if you live in flood-prone cities."
        }
    ];

    console.log("Seeding claim cases...");
    for (const c of cases) {
        await prisma.claimCase.create({ data: c });
    }
    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
