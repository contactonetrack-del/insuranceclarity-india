const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/mega-database.json');
let db = require(dbPath);

console.log("Original DB size:", db.length);

function patchItem(item) {
    // 1. OECD Classification (Life, Non-Life, Composite)
    if (['Life Insurance', 'Health Insurance'].includes(item.sector) || item.irdaiClass === 'Life Insurance') {
        item.oecdClassification = 'Life';
    } else {
        item.oecdClassification = 'Non-Life (P&C)';
    }

    // 2. NAIC Sector (Life/Annuity, Health, Property/Casualty)
    if (item.sector === 'Health Insurance' || item.irdaiClass === 'Health Insurance') {
        item.naicSector = 'Health';
    } else if (item.sector === 'Life Insurance' || item.irdaiClass === 'Life Insurance') {
        item.naicSector = 'Life & Annuity';
    } else {
        item.naicSector = 'Property & Casualty';
    }

    // 3. Coverage Purpose
    if (item.users === 'Business' || item.users === 'Industry' || item.sector.includes('Business') || item.sector.includes('Commercial') || item.sector.includes('Industrial')) {
        item.coveragePurpose = 'Commercial Entity Protection';
    } else {
        item.coveragePurpose = 'Personal Wealth & Asset Protection';
    }

    // 4. Risk Type (Derived from Subcategory or Sector)
    if (item.sector.includes('Liability') || item.subcategory.includes('Liability')) {
        item.riskType = 'Legal & Third-Party Injury';
    } else if (item.sector.includes('Cyber') || item.sector.includes('Technology')) {
        item.riskType = 'Digital & Intangible Harm';
    } else if (item.sector.includes('Property') || item.sector.includes('Motor') || item.sector.includes('Aviation') || item.sector.includes('Marine')) {
        item.riskType = 'Physical Asset Damage';
    } else if (item.sector.includes('Health') || item.sector.includes('Life')) {
        item.riskType = 'Mortality & Morbidity';
    } else if (item.sector.includes('Agriculture') || item.sector.includes('Environmental') || item.sector.includes('Energy')) {
        item.riskType = 'Climate & Natural Perils';
    } else {
        item.riskType = 'Financial Loss & Interruption';
    }

    return item;
}

let modifiedCount = 0;
db.forEach((item, index) => {
    db[index] = patchItem(item);
    modifiedCount++;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Successfully patched ${modifiedCount} database items with OECD, NAIC, Purpose, and Risk taxonomy tags.`);
