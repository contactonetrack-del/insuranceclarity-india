const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const pdfDir = path.join(__dirname, '../public/PDFs');
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
}

// Design Tokens
const COLORS = {
    NAVY: '#1e293b',
    PRIMARY: '#2563eb',
    ACCENT: '#3b82f6',
    EMERALD: '#059669',
    ROSE: '#e11d48',
    SLATE: '#64748b',
    BG_LIGHT: '#f8fafc',
    WHITE: '#ffffff'
};

/**
 * Layout Helpers
 */
class PDFDesignEngine {
    constructor(doc) {
        this.doc = doc;
    }

    drawHeader(title, pageNumber) {
        this.doc.rect(0, 0, 612, 60).fill(COLORS.NAVY);
        this.doc.fillColor(COLORS.WHITE).fontSize(12).text(title, 50, 25);
        if (pageNumber) {
            this.doc.text(`Page ${pageNumber}`, 500, 25, { align: 'right' });
        }
    }

    drawFooter() {
        this.doc.rect(0, 750, 612, 42).fill(COLORS.BG_LIGHT);
        this.doc.fillColor(COLORS.SLATE).fontSize(8).text('© 2026 InsuranceClarity India | Professional Advisory Series', 50, 765);
    }

    sectionHeader(text, color = COLORS.PRIMARY) {
        this.doc.moveDown(2);
        const y = this.doc.y;
        this.doc.rect(50, y, 4, 30).fill(color);
        this.doc.fillColor(COLORS.NAVY).fontSize(18).text(text, 65, y + 5);
        this.doc.moveDown(1.5);
    }

    calloutBox(title, text, color = COLORS.ACCENT) {
        const startY = this.doc.y;
        this.doc.rect(50, startY, 512, 80).fill(COLORS.BG_LIGHT);
        this.doc.rect(50, startY, 4, 80).fill(color);
        this.doc.fillColor(color).fontSize(10).text(title.toUpperCase(), 70, startY + 15, { font: 'Helvetica-Bold' });
        this.doc.fillColor(COLORS.NAVY).fontSize(10).text(text, 70, startY + 35, { width: 470 });
        this.doc.moveDown(5);
    }

    drawBarChart(data, title) {
        this.doc.moveDown(1);
        const startY = this.doc.y;
        this.doc.fillColor(COLORS.NAVY).fontSize(12).text(title, { align: 'center' });
        this.doc.moveDown(1);

        const chartHeight = 150;
        const chartWidth = 400;
        const startX = 100;

        // Axes
        this.doc.lineWidth(1).strokeColor(COLORS.SLATE).moveTo(startX, this.doc.y).lineTo(startX, this.doc.y + chartHeight).lineTo(startX + chartWidth, this.doc.y + chartHeight).stroke();

        let barY = this.doc.y + 10;
        const barHeight = 20;
        const maxVal = Math.max(...data.map(d => d.value));

        data.forEach(item => {
            const barWidth = (item.value / maxVal) * chartWidth;
            this.doc.rect(startX + 1, barY, barWidth, barHeight).fill(item.color || COLORS.ACCENT);
            this.doc.fillColor(COLORS.NAVY).fontSize(8).text(item.label, 30, barY + 5, { width: 65, align: 'right' });
            this.doc.fillColor(COLORS.WHITE).text(`${item.value}L`, startX + 5, barY + 5);
            barY += barHeight + 10;
        });

        this.doc.moveDown(8);
    }

    drawTable(headers, rows) {
        const startX = 50;
        let startY = this.doc.y;
        const colWidth = 512 / headers.length;

        // Header Background
        this.doc.rect(startX, startY, 512, 25).fill(COLORS.NAVY);
        this.doc.fillColor(COLORS.WHITE).fontSize(10);

        headers.forEach((h, i) => {
            this.doc.text(h, startX + (i * colWidth), startY + 7, { width: colWidth, align: 'center' });
        });

        startY += 25;
        rows.forEach((row, rowIndex) => {
            if (rowIndex % 2 === 0) {
                this.doc.rect(startX, startY, 512, 25).fill('#f1f5f9');
            }
            this.doc.fillColor(COLORS.NAVY).fontSize(9);
            row.forEach((cell, i) => {
                this.doc.text(cell.toString(), startX + (i * colWidth), startY + 8, { width: colWidth, align: 'center' });
            });
            startY += 25;
        });
        this.doc.y = startY + 20;
    }
}

/**
 * GUIDE 1: TERM INSURANCE
 */
function generateTermInsuranceGuide() {
    const doc = new PDFDocument({ size: 'LETTER', autoFirstPage: false });
    const engine = new PDFDesignEngine(doc);
    const filename = path.join(pdfDir, 'term-insurance-guide.pdf');
    const out = fs.createWriteStream(filename);
    doc.pipe(out);

    // --- PAGE 1: COVER ---
    doc.addPage();
    doc.rect(0, 0, 612, 792).fill(COLORS.NAVY);
    doc.fillColor(COLORS.WHITE);
    doc.fontSize(32).text('How to Choose\nTerm Insurance', 50, 250);
    doc.fontSize(16).fillColor(COLORS.ACCENT).text('The Complete Guide for Indian Families', 50, 330);
    doc.rect(50, 360, 100, 4).fill(COLORS.ACCENT);

    doc.fontSize(10).fillColor(COLORS.SLATE).text('Professional Advisory Series | Volume 01', 50, 700);
    doc.fontSize(12).fillColor(COLORS.WHITE).text('insuranceclarity.in', 500, 700, { align: 'right' });

    // --- PAGE 2: INTRODUCTION & IMPORTANCE ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 2);
    engine.sectionHeader('1. Understanding Term Insurance');
    doc.fillColor(COLORS.NAVY).fontSize(11).text(
        'Term insurance is the simplest and purest form of life insurance. It provides high financial coverage (Sum Assured) for a specific "term" or period. If the policyholder passes away during this term, the nominee receives the death benefit.\n\nUnlike investment-linked insurance, term insurance has no maturity value, making it extremely affordable. For example, a 30-year-old can get a ₹1 Crore cover for as low as ₹800–1,000 per month.'
    );

    engine.sectionHeader('2. Why it is Critical for Your Family');
    doc.text(
        'In India, the financial protection gap is significant. If an earning member is lost, families often face immediate debt crises and loss of lifestyle. Term insurance acts as a "Financial Shield" that ensures:\n\n' +
        '• Your home loan and other debts are cleared immediately.\n' +
        '• Your child\'s education and marriage goals stay on track.\n' +
        '• Your spouse enjoys a dignified, self-reliant life.'
    );

    engine.calloutBox('Shocking Statistic', 'According to a recent report, 9 out of 10 Indian professional families are under-insured, with current life cover barely lasting 2 years of expenses.', COLORS.ROSE);
    engine.drawFooter();

    // --- PAGE 3: COVERAGE NEEDS ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 3);
    engine.sectionHeader('3. How Much Coverage Do You Need?');
    doc.text('There are three primary methods to calculate your ideal sum assured:');

    doc.moveDown();
    doc.fontSize(10).fillColor(COLORS.NAVY).text('A. Rule of Thumb: 10–15X Annual Income\nB. Human Life Value (HLV): Your future earnings potential expressed in today\'s value.\nC. Expense-Based: (Monthly Expenses x Months to Retirement) + Total Liabilities - Existing Assets.');

    engine.drawBarChart([
        { label: '₹5L Income', value: 75, color: COLORS.ACCENT },
        { label: '₹10L Income', value: 150, color: COLORS.ACCENT },
        { label: '₹20L Income', value: 300, color: COLORS.PRIMARY },
        { label: '₹50L Income', value: 750, color: COLORS.NAVY }
    ], 'Recommended Coverage (in Lakhs) vs Annual Income');

    engine.calloutBox('Calculation Example', 'A professional earning ₹15 Lakhs/year with a ₹50 Lakh Home Loan should ideally aim for: (15L x 10) + 50L = ₹2 Crore Cover.', COLORS.EMERALD);
    engine.drawFooter();

    // --- PAGE 4: METRICS & COMPARISON ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 4);
    engine.sectionHeader('4. Decoding Insurance Metrics');
    doc.text('Do not buy based on premium alone. Check these three IRDAI-mandated metrics:');

    doc.moveDown();
    engine.drawTable(
        ['Metric', 'What it Means', 'Ideal Benchmark'],
        [
            ['CSR %', '% of claims settled vs received', '> 98.0%'],
            ['ASR %', 'Total value of claims paid', '> 94.0%'],
            ['Solvency', 'Company\'s ability to pay debts', '> 1.50 (150%)']
        ]
    );

    doc.text('Sample Snapshot (FY 24-25 Data):');
    engine.drawTable(
        ['Insurer', 'Claim Ratio (CSR)', 'Solvency Ratio'],
        [
            ['HDFC Life', '99.68%', '1.92'],
            ['ICICI Pru', '99.04%', '1.85'],
            ['Max Life', '99.51%', '2.01'],
            ['TATA AIA', '98.90%', '1.74']
        ]
    );
    engine.drawFooter();

    // --- PAGE 5: TERM & RIDERS ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 5);
    engine.sectionHeader('5. Choosing the Right Policy Term');
    doc.text('A common mistake is choosing cover till age 85 or 99. You only need insurance as long as you have financial dependents and liabilities.');

    doc.rect(50, 180, 512, 40).fill(COLORS.BG_LIGHT);
    doc.fillColor(COLORS.NAVY).fontSize(10).text('30s (Buying Now)  ------------------> 60s (Retirement)  ------------------> 80s (Over-Insured)', 70, 195);

    engine.sectionHeader('6. Vital Riders (Options)');
    doc.text('Riders are "Add-ons" that enhance your protection for a small extra premium:');
    engine.drawTable(
        ['Rider Name', 'Purpose', 'Priority'],
        [
            ['Critical Illness', 'Lump sum payout on cancer/stroke', 'Essential'],
            ['Waiver of Premium', 'Lapse protection on disability', 'High'],
            ['Accidental Death', 'Additional SA on accidents', 'Moderate'],
            ['Disability Rider', 'Income replacement for injury', 'High']
        ]
    );
    engine.drawFooter();

    // --- PAGE 6: MISTAKES & PROCESS ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 6);
    engine.sectionHeader('7. Common Mistakes to Avoid');
    doc.list([
        'Hiding Medical History: Leading cause of claim rejection. Disclose smoking and past illnesses.',
        'Ignoring Inflation: ₹1 Crore today will be worth only ₹25 Lakhs in 20 years. Choose "Increasing Cover".',
        'Buying Investment Plans: Never mix insurance and investment. Buy pure term and invest in Mutual Funds.',
        'Waiting too long: Premiums increase significantly every year you age.'
    ]);

    engine.sectionHeader('8. Simplified Buying Process');
    doc.fontSize(10).text('1. Calculate SA (15x Income) --> 2. Compare Online (CSR/Solvency) --> 3. Select Term (Till 60) --> 4. Undergo Medicals --> 5. Policy Issuance.');

    doc.rect(50, 480, 512, 100).stroke();
    doc.fontSize(9).text('PRO TIP: Opt for the "Monthly" or "Annual" premium payment mode. Avoid "Single Premium" or "Limited Pay" unless you have sudden windfalls, as traditional yearly premiums are mathematically more efficient when accounting for inflation.', 70, 500, { width: 470 });
    engine.drawFooter();

    // --- PAGE 7: CLAIM PROCESS & NOMINATION ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 7);
    engine.sectionHeader('9. The Claim Settlement Process');
    doc.text('A nominee is often in emotional distress during a claim. Knowing the steps in advance is crucial:');
    engine.drawTable(
        ['Step', 'Timeline', 'Contact Point'],
        [
            ['Intimation', 'Within 15 days', 'Online/Branch'],
            ['Documentation', 'Within 30 days', 'Document Courier'],
            ['Investigation', 'Within 60 days', 'Claims Officer'],
            ['Settlement', 'T+30 days', 'Bank Account (NEFT)']
        ]
    );

    doc.moveDown();
    doc.fontSize(10).fillColor(COLORS.NAVY).text('Essential Documents: 1. Death Certificate (Original), 2. Policy Bond, 3. Nominee ID/Cancel Cheque, 4. Physician\'s Report.');

    engine.sectionHeader('10. Nomination vs Appointee');
    doc.text('Ensure your nominee is an adult. If you nominate a minor child, you MUST name an "Appointee" who will receive the funds on behalf of the minor.');
    engine.drawFooter();

    // --- PAGE 8: MWP ACT (CRITICAL) ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 8);
    engine.sectionHeader('11. The MWP Act: Protecting Your Family');
    doc.text('The Married Women\'s Property (MWP) Act, 1874, is a legal protection for your term insurance proceeds.');

    engine.calloutBox('Why take MWP?', 'Under MWP Act, the death benefit belongs ONLY to the wife and children. It CANNOT be attached by creditors, relatives, or for bank loan recoveries. It creates a trust for your family.', COLORS.PRIMARY);

    doc.text('\nWho should buy under MWP Act?');
    doc.list([
        'Business owners with business loans.',
        'Salaried professionals with high personal/housing loans.',
        'Anyone who wants to ensure relatives don\'t claim the money.'
    ]);
    engine.drawFooter();

    // --- PAGE 9: TAX BENEFITS ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 9);
    engine.sectionHeader('12. Tax Benefits (80D & 10(10D))');
    doc.text('Term insurance is one of the most tax-efficient instruments in India:');

    engine.drawTable(
        ['Section', 'Benefit Type', 'Limit'],
        [
            ['80C', 'Premium Deduction', 'Up to ₹1.5L'],
            ['10(10D)', 'Tax-Free Payout', 'Unlimited (if SA > 10x)'],
            ['80D', 'Health Rider Premium', 'Up to ₹25,000']
        ]
    );

    engine.sectionHeader('13. Regular Pay vs Limited Pay');
    doc.text('Should you pay for 30 years or finish in 5 years?');
    doc.list([
        'Regular Pay: Best for cash-flow. Inflation makes future premiums "cheaper".',
        'Limited Pay: Best if you have high current income but uncertain future (e.g. cricketers, actors). Payout is faster but expensive today.'
    ]);
    engine.drawFooter();

    // --- PAGE 10: CASE STUDY & COMPARISON ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 10);
    engine.sectionHeader('14. Case Study: Rahul, 32');
    doc.text('Rahul is a Software Engineer earning ₹24 LPA. He has a wife, a 2-year old child, and a ₹60L Home Loan.');

    doc.moveDown();
    doc.fillColor(COLORS.PRIMARY).text('RAHUL\'S PLAN:');
    doc.fillColor(COLORS.NAVY).list([
        'Sum Assured: ₹3 Crores (12.5x Income)',
        'Policy Term: 28 Years (Till age 60)',
        'Riders: Waiver of Premium + ₹20L Critical Illness',
        'Monthly Premium: ~₹2,200',
        'Nominee: Wife (Primary) under MWP Act'
    ]);

    engine.calloutBox('Outlook', 'If Rahul passes away at 45, his wife gets ₹3 Cr. ₹60L clears the loan, ₹50L goes into Child\'s education fund, and ₹1.9 Cr provides a ₹90k monthly interest-based income.', COLORS.NAVY);
    engine.drawFooter();

    // --- PAGE 11: FAQ & CHECKLIST ---
    doc.addPage();
    engine.drawHeader('Term Insurance Guide', 11);
    engine.sectionHeader('15. Frequently Asked Questions');
    doc.list([
        'Q: Can I have multiple policies? Yes, disclose existing ones to the new insurer.',
        'Q: What if I start smoking later? Inform the insurer to avoid claim issues.',
        'Q: Is suicide covered? Most Indian term plans cover suicide after 12 months.',
        'Q: Will the premium change? No, "Level" term premiums remain fixed for life.'
    ]);

    engine.sectionHeader('Final Buying Checklist');
    doc.list([
        'Is the Sum Assured 15x annual income?',
        'Does the insurer have >98% CSR?',
        'Did I disclose my medical history accurately?',
        'Did I choose "Waiver of Premium" rider?',
        'Is the policy registered under MWP Act?',
        'Is the term only till my retirement?'
    ]);
    engine.drawFooter();

    // --- PAGE 12: DISCLAIMER ---
    doc.addPage();
    doc.rect(50, 300, 512, 120).stroke();
    doc.fillColor(COLORS.SLATE).fontSize(10).text('PROFESSIONAL DISCLAIMER', { align: 'center' });
    doc.moveDown();
    doc.fontSize(8).text(
        'The information provided in this guide is for general educational purposes only and does not constitute financial or legal advice. Insurance products are complex and subject to market risks and policy terms. We strongly recommend consulting with a certified financial planner or a licensed insurance advisor before making any purchase decisions. Data regarding insurer CSR and Solvency is based on available IRDAI reports (FY 23-24/24-25) and is subject to change. Always read the policy document (Prospectus/Sales Illustration) carefully before signing.',
        { align: 'justify' }
    );

    doc.end();
    console.log('Term Insurance Guide Generated');
}

/**
 * GUIDE 2: HEALTH INSURANCE
 */
function generateHealthInsuranceGuide() {
    const doc = new PDFDocument({ size: 'LETTER', autoFirstPage: false });
    const engine = new PDFDesignEngine(doc);
    const filename = path.join(pdfDir, 'health-buying-checklist.pdf');
    const out = fs.createWriteStream(filename);
    doc.pipe(out);

    doc.addPage();
    doc.rect(0, 0, 612, 792).fill(COLORS.EMERALD);
    doc.fillColor(COLORS.WHITE);
    doc.fontSize(32).text('Health Insurance\nBuying Checklist', 50, 250);
    doc.fontSize(16).text('Protecting Your Wealth From Healthcare Inflation', 50, 330);
    engine.drawFooter();

    doc.addPage();
    engine.drawHeader('Health Insurance Checklist', 2);
    engine.sectionHeader('1. The Medical Inflation Challenge');
    doc.fillColor(COLORS.NAVY).text('India\'s medical inflation is currently at 14%—the highest in Asia. A procedure costing ₹5 Lakhs today will cost ₹19 Lakhs in 10 years.');

    engine.drawBarChart([
        { label: '2025 (Now)', value: 5, color: COLORS.EMERALD },
        { label: '2030 (Est)', value: 9.5, color: COLORS.EMERALD },
        { label: '2035 (Est)', value: 18, color: COLORS.ROSE }
    ], 'Estimated Cost of Surgery (in Lakhs)');

    engine.sectionHeader('2. Critical Clauses Checklist');
    engine.drawTable(
        ['Clause', 'Impact', 'What to Choose'],
        [
            ['Waiting Period', 'Time before disease cover', 'Ideally 1-2 Years'],
            ['Room Rent', 'Caps on daily room cost', 'No Sub-limits'],
            ['Restoration', 'Refills sum assured', 'Unlimited/Same Illness'],
            ['Co-pay', 'Your % of the bill', '0% (No Co-pay)']
        ]
    );

    engine.sectionHeader('3. Individual vs Family Floater');
    doc.text('Floater plans are cost-effective but share the sum assured. If one member uses ₹8L of a ₹10L cover, only ₹2L remains for others. Choose Individuals for parents and Floaters for young couples.');
    engine.drawFooter();

    doc.addPage();
    engine.drawHeader('Health Insurance Checklist', 3);
    engine.sectionHeader('4. No Claim Bonus (NCB) Benefits');
    doc.text('For every claim-free year, insurers increase your Sum Insured by 10% to 50% without increasing the premium. Some "Super NCB" plans can double your cover in just 2 years.');

    engine.sectionHeader('5. Portability & Wellness');
    doc.list([
        'Portability: You can switch insurers without losing credit for waiting periods.',
        'Wellness: Many 2025 plans offer premium discounts (up to 30%) if you hit 10k steps daily or maintain a healthy BMI.',
        'Annual Checkups: Most comprehensive plans offer a free medical checkup once a year.'
    ]);

    engine.sectionHeader('6. Cashless Network');
    doc.text('Always choose an insurer with a high number of "Cashless" hospitals in your city/neighborhood. Avoid reimbursement claims as they drain your emergency fund during hospitalization.');

    engine.sectionHeader('7. Pre-Existing Diseases (PED)');
    doc.text('Be 100% honest. If you have Diabetes or BP, declare it. You might have to wait 2-4 years, but your claim will be honored. Hiding it guarantees rejection.');

    engine.calloutBox('Selection Tip', 'For a family of four (2 Adults + 2 Kids), a ₹10L - ₹15L Sum Insured with a ₹1 Cr "Super Top-up" is the most cost-effective way to get massive cover.', COLORS.EMERALD);

    doc.end();
    console.log('Health Insurance Guide Generated');
}

/**
 * GUIDE 3: MOTOR CLAIMS
 */
function generateMotorClaimsGuide() {
    const doc = new PDFDocument({ size: 'LETTER', autoFirstPage: false });
    const engine = new PDFDesignEngine(doc);
    const filename = path.join(pdfDir, 'motor-claims-guide.pdf');
    const out = fs.createWriteStream(filename);
    doc.pipe(out);

    doc.addPage();
    doc.rect(0, 0, 612, 792).fill(COLORS.PRIMARY);
    doc.fillColor(COLORS.WHITE);
    doc.fontSize(32).text('Motor Insurance\nClaims Process', 50, 250);
    doc.fontSize(16).text('Step-by-Step Recovery & Settlement Guide', 50, 330);
    engine.drawFooter();

    doc.addPage();
    engine.drawHeader('Motor Claims Guide', 2);
    engine.sectionHeader('1. Immediate Post-Accident Steps');
    doc.fillColor(COLORS.NAVY).list([
        'Don\'t Panic: Turn on hazards and move passengers to safety.',
        'Evidence First: Take high-res photos/videos of your car, third party plates, and the location.',
        'No Unauthorized Repairs: Towing to a garage before surveyor inspection can void the claim.',
        'Inform Insurer: Most policies require intimation within 24-48 hours.'
    ]);

    engine.sectionHeader('2. When do you need an FIR?');
    engine.drawTable(
        ['Scenario', 'FIR Required?', 'Legal Priority'],
        [
            ['Theft', 'YES (Mandatory)', 'Critical'],
            ['Third Party Injury', 'YES (Mandatory)', 'Legal Requirement'],
            ['Minor Dents', 'NO', 'Low'],
            ['Vandalism/Fire', 'YES', 'High']
        ]
    );
    engine.drawFooter();

    doc.addPage();
    engine.drawHeader('Motor Claims Guide', 3);
    engine.sectionHeader('3. Zero-Depreciation & Riders');
    doc.text('Standard policies only pay ~50% for plastic/rubber parts. A Zero-Dep (Bumper-to-Bumper) rider ensures 100% payout excluding compulsory deductibles.');

    doc.moveDown();
    engine.drawTable(
        ['Rider', 'What it Covers', 'Value'],
        [
            ['Engine Protect', 'Water ingression/Hydrostatic lock', 'High'],
            ['Consumables', 'Oil, nuts, bolts, coolant', 'Moderate'],
            ['NCB Protect', 'Keeps NCB even after 1 claim', 'Recommended'],
            ['Return to Invoice', 'Full invoice price on Total Loss', 'Essential for New Cars']
        ]
    );

    engine.sectionHeader('4. Understanding IDV');
    doc.text('IDV (Insured Declared Value) is the maximum claim amount for total loss. It is the "Current Market Value" of your car. Never lower it just to save on premium.');

    engine.sectionHeader('5. Surveyor & Inspection');
    doc.text('An IRDAI-licensed surveyor will visit the garage. They assess the "Causality" (did the accident cause this damage?) and the "Estimate".');

    engine.calloutBox('Surveyor Warning', 'Differentiate between "Existing" (old) and "Accidental" (new) damages. Trying to claim old scratches under a new accident claim is considered insurance fraud.', COLORS.ROSE);

    engine.sectionHeader('6. Cashless vs Reimbursement');
    doc.text('Cashless is always preferred. The insurer pays the network garage directly, and you only pay "Deductibles" and "Depreciation" (unless you have a Zero-Dep policy).');

    doc.end();
    console.log('Motor Claims Guide Generated');
}

// Run Generation
generateTermInsuranceGuide();
generateHealthInsuranceGuide();
generateMotorClaimsGuide();
