const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/mega-database.json');
let db = require(dbPath);

console.log("Original DB size:", db.length);

const sectorTemplates = {
    'Life Insurance': [
        "The {name} policy represents a fundamental risk-management instrument within the Life Insurance sector, officially classified under {category}. Formulated primarily for {users}, this policy provides critical financial security against {subcategory} contingencies.",
        "Underwritten to global standards and fully compliant with IRDAI regulations, it guarantees predetermined payouts upon triggering events.",
        "Actuarial models for this product prioritize long-term stability, making it a cornerstone for comprehensive wealth and estate planning."
    ],
    'Health Insurance': [
        "Specifically engineered for the {category} space, the {name} product offers extensive medical and hospitalization coverage.",
        "Tailored for {users}, it addresses the escalating costs associated with {subcategory} through structured deductibles and broad network access.",
        "This policy aligns with critical health infrastructure standards, ensuring policyholders receive vital care without catastrophic financial depletion."
    ],
    'Personal Insurance': [
        "Operating within the Personal Insurance domain, the {name} policy is a targeted {category} solution.",
        "It provides {users} with indispensable coverage for {subcategory} related risks, bridging the gap between standard health and property covers.",
        "Regulated tightly by domestic authorities, it affords peace of mind through rapid claims settlement and explicit coverage boundaries."
    ],
    'Property Insurance': [
        "The {name} stands as a primary defense mechanism against physical asset degradation within the {category} classification.",
        "Designed to shield {users} from {subcategory} damages, the policy evaluates risk based on geographic and structural metrics.",
        "It indemnifies the policyholder up to the replacement or actual cash value, ensuring immediate recovery capabilities following unforeseen perils."
    ],
    'Motor & Transportation Insurance': [
        "Essential for the {category} sector, the {name} policy provides comprehensive liability and physical damage protection.",
        "Mandated or highly recommended for {users}, it precisely targets {subcategory} exposures inherent in modern transit.",
        "The cover utilizes telematics and historical claims data to optimize premium pricing, ensuring legal compliance and financial restitution post-incident."
    ],
    'Commercial & Business Insurance': [
        "The {name} is a sophisticated commercial instrument architected for the {category} portfolio.",
        "Protecting {users} against complex {subcategory} operational risks, it acts as a bulwark against revenue interruption and asset loss.",
        "Corporate risk managers rely on this coverage to guarantee enterprise continuity and satisfy rigorous stakeholder and regulatory mandates."
    ],
    'Liability Insurance': [
        "Focusing strictly on third-party exposures, the {name} policy falls under the critical {category} umbrella.",
        "It shields {users} from devastating legal judgments and defense costs arising from {subcategory} claims.",
        "In our increasingly litigious corporate environment, this specialized indemnity cover is vital for safeguarding balance sheets against unpredictable legal liabilities."
    ],
    'Marine & Aviation Insurance': [
        "Governing high-value international and domestic transit, the {name} is categorized under {category}.",
        "It protects {users} against profound {subcategory} risks associated with cargo, hull, and freight operations over global trade routes.",
        "Rooted in centuries of maritime and aviation underwriting tradition, it provides essential liquidity guarantees for global supply chains."
    ],
    'Technology & Cyber Insurance': [
        "Addressing frontier digital risks, the {name} is a state-of-the-art policy within the {category} segment.",
        "Designed for {users} navigating an interconnected world, it responds directly to {subcategory} threats including breaches, extortion, and system outages.",
        "This dynamic coverage is continually updated against emerging threat vectors, offering vital IT forensic resources alongside financial indemnity."
    ]
};

const defaultTemplate = [
    "The {name} is a meticulously designed {category} product serving the broader {sector} landscape.",
    "Engineered explicitly for {users}, it provides highly specialized mitigation against {subcategory} risk factors.",
    "Subject to rigorous underwriting guidelines, this policy ensures targeted financial indemnity and regulatory compliance within its designated market."
];

function enhanceDescription(item) {
    let tplArray = sectorTemplates[item.sector] || defaultTemplate;

    // Pick 2 or 3 sentences logically
    let sentence1 = tplArray[0].replace('{name}', item.name).replace('{category}', item.category).replace('{users}', item.users).replace('{subcategory}', item.subcategory).replace('{sector}', item.sector);
    let sentence2 = tplArray[1].replace('{name}', item.name).replace('{category}', item.category).replace('{users}', item.users).replace('{subcategory}', item.subcategory).replace('{sector}', item.sector);
    let sentence3 = tplArray[2].replace('{name}', item.name).replace('{category}', item.category).replace('{users}', item.users).replace('{subcategory}', item.subcategory).replace('{sector}', item.sector);

    return `${sentence1} ${sentence2} ${sentence3}`;
}

let modifiedCount = 0;
db.forEach(item => {
    let newDesc = enhanceDescription(item);
    if (item.description !== newDesc) {
        item.description = newDesc;
        modifiedCount++;
    }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Successfully enhanced ${modifiedCount} database descriptions.`);
