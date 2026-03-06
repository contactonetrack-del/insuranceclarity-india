const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const pdfDir = path.join(__dirname, '../public/PDFs');
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
}

function createTermInsuranceGuide() {
    const doc = new PDFDocument({ margin: 50 });
    const filename = path.join(pdfDir, 'term-insurance-guide.pdf');
    doc.pipe(fs.createWriteStream(filename));

    // Header
    doc.fontSize(20).text('How to Choose Term Insurance: A Complete Guide', { align: 'center' });
    doc.moveDown();

    // Section 1: Assess Coverage
    doc.fontSize(14).fillColor('blue').text('1. Assess Your Coverage Needs');
    doc.fontSize(10).fillColor('black').text('Rule of thumb: Aim for a sum assured that is at least 10-15 times your annual income. Factor in current liabilities (loans), children\'s education, and spouse\'s retirement.');
    doc.moveDown();

    // Section 2: Insurer Credibility
    doc.fontSize(14).fillColor('blue').text('2. Evaluate Insurer Credibility (IRDAI Metrics)');
    doc.fontSize(10).fillColor('black').list([
        'Claim Settlement Ratio (CSR): Look for insurers with a CSR consistently above 95% over the last 3 years.',
        'Solvency Ratio: IRDAI mandates a minimum of 1.5 (150%). A ratio above 2.0 (200%) indicates strong financial health.',
        'Amount Settlement Ratio (ASR): Ensures the insurer pays out large value claims, not just small ones to inflate CSR.'
    ]);
    doc.moveDown();

    // Section 3: Riders
    doc.fontSize(14).fillColor('blue').text('3. Essential Riders to Consider');
    doc.fontSize(10).fillColor('black').text('Consider Waiver of Premium (waives future premiums on disability), Critical Illness (lump sum payout on diagnosis), and Accidental Death Benefit.');
    doc.moveDown();

    // Footer
    doc.fontSize(8).fillColor('gray').text('This is a guide for information purposes. Consult with a licensed insurance advisor before purchasing.', { align: 'center', bottom: 50 });

    doc.end();
    console.log(`Generated: ${filename}`);
}

function createHealthInsuranceChecklist() {
    const doc = new PDFDocument({ margin: 50 });
    const filename = path.join(pdfDir, 'health-buying-checklist.pdf');
    doc.pipe(fs.createWriteStream(filename));

    doc.fontSize(20).text('Health Insurance Buying Checklist', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).fillColor('green').text('Critical Clauses to Check');
    doc.fontSize(10).fillColor('black').list([
        'Waiting Periods: Check for Initial (30 days), Specific Disease (2 years), and Pre-existing Disease (1-4 years) waiting periods.',
        'Restoration Benefit: Ensure 100% restoration activates even for the same illness or same person (if possible).',
        'Co-payment: Ideally select "No Co-pay" for younger family members. 20% co-pay is common for senior citizens.',
        'OPD Coverage: Check if doctor consultations and diagnostic tests are covered outside hospitalization.',
        'Sub-limits: Avoid policies with room rent caps (e.g. 1% of sum assured) as they lead to significant out-of-pocket costs.'
    ]);
    doc.moveDown();

    doc.fontSize(14).fillColor('green').text('Documentation Required');
    doc.fontSize(10).fillColor('black').list([
        'Age Proof (Aadhaar/Passport)',
        'Address Proof',
        'Income Proof (for high sum assured)',
        'Medical Reports (for age > 45 or high BMI)'
    ]);

    doc.end();
    console.log(`Generated: ${filename}`);
}

function createMotorClaimsGuide() {
    const doc = new PDFDocument({ margin: 50 });
    const filename = path.join(pdfDir, 'motor-claims-guide.pdf');
    doc.pipe(fs.createWriteStream(filename));

    doc.fontSize(20).text('Motor Insurance Claims Process: Step-by-Step', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).fillColor('orange').text('Step 1: Immediate Actions');
    doc.fontSize(10).fillColor('black').text('Do not move the vehicle. Take photos of the damage and third-party plates. Inform the insurer within 24 hours.');
    doc.moveDown();

    doc.fontSize(14).fillColor('orange').text('Step 2: Filing an FIR');
    doc.fontSize(10).fillColor('black').text('Mandatory for: Theft, Third-party injury/death, Major accidents with significant property damage. Optional for minor dents/scratches.');
    doc.moveDown();

    doc.fontSize(14).fillColor('orange').text('Step 3: The Survey Process');
    doc.fontSize(10).fillColor('black').text('The insurer will appoint a surveyor (mandated by IRDAI for losses > 50,000 INR). Do not repair the vehicle before the surveyor provides the inspection report.');
    doc.moveDown();

    doc.fontSize(14).fillColor('orange').text('Step 4: Cashless vs Reimbursement');
    doc.fontSize(10).fillColor('black').list([
        'Cashless: Repairs done at network garages. Insurer pays garage directly.',
        'Reimbursement: Pay upfront at any garage of choice and claim later with original bills and FIR copy.'
    ]);

    doc.end();
    console.log(`Generated: ${filename}`);
}

createTermInsuranceGuide();
createHealthInsuranceChecklist();
createMotorClaimsGuide();
