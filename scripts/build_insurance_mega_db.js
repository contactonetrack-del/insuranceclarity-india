const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/chauh/.gemini/antigravity/brain/7bbcec67-121b-43ab-9157-c876eb1bc5f1';
const DB = [];
let count = 0;

function a(sector, cat, subcat, list, desc, users, irdai, global, rel) {
    list.forEach(t => {
        DB.push({
            id: ++count,
            name: t,
            sector, category: cat, subcategory: subcat,
            description: desc.replace('{t}', t),
            users, irdaiClass: irdai, globalUse: global,
            related: rel.join(', ')
        });
    });
}

// 1. Life Insurance (51 items)
a('Life Insurance', 'Term Life', 'Level Term', ['10-Year Level Term Life', '15-Year Level Term Life', '20-Year Level Term Life', '25-Year Level Term Life', '30-Year Level Term Life'], 'Provides {t} pure life cover.', 'Individual', 'Life Insurance', 'Global', ['Whole Life']);
a('Life Insurance', 'Term Life', 'Decreasing Term', ['Mortgage Protection Term Life', 'Business Loan Protection Term Life', 'Credit Life Insurance', 'Family Income Benefit Term'], 'Provides {t} coverage that decreases over time.', 'Individual/Business', 'Life Insurance', 'Global', ['Term Life']);
a('Life Insurance', 'Term Life', 'Special Term', ['Increasing Term Life', 'Convertible Term Life', 'Renewable Term Life', 'Return of Premium Term Life (ROP)', 'Annually Renewable Term (ART)'], 'Provides {t} flexible coverage.', 'Individual', 'Life Insurance', 'Global', ['Term Life']);
a('Life Insurance', 'Whole Life', 'Traditional Whole Life', ['Ordinary Whole Life', 'Non-Participating Whole Life', 'Participating Whole Life', 'Limited-Pay Whole Life', 'Single Premium Whole Life', 'Modified Whole Life', 'Graded Premium Whole Life'], 'Permanent {t} coverage with cash value.', 'Individual', 'Life Insurance', 'Global', ['Term Life', 'Endowment']);
a('Life Insurance', 'Universal Life', 'Flexible Life', ['Standard Universal Life', 'Indexed Universal Life (IUL)', 'Variable Universal Life (VUL)', 'Guaranteed Universal Life (GUL)', 'Survivorship Universal Life', 'Joint Universal Life'], 'Flexible premium {t} permanent coverage.', 'Individual', 'Life Insurance', 'Global', ['Whole Life']);
a('Life Insurance', 'Endowment', 'Savings Life', ['Standard Endowment Plan', 'With-Profit Endowment', 'Without-Profit Endowment', 'Unit-Linked Endowment', 'Full Endowment Policy', 'Capped Endowment Policy', 'Money Back Endowment Policy'], 'Savings and insurance combined via {t}.', 'Individual', 'Life Insurance', 'Global', ['ULIP', 'Whole Life']);
a('Life Insurance', 'Child Plans', 'Education Planning', ['Child Education Endowment', 'Child Unit-Linked Insurance Plan', 'Child Money Back Plan', 'Waiver of Premium Child Plan', 'Child Single Premium Plan'], 'Secures child future via {t}.', 'Individual', 'Life Insurance', 'Global', ['Endowment']);
a('Life Insurance', 'Pension & Annuity', 'Retirement', ['Immediate Annuity', 'Deferred Annuity', 'Fixed Annuity', 'Variable Annuity', 'Indexed Annuity', 'Joint Life Survivor Annuity', 'Life Annuity with Return of Purchase Price'], 'Provides post-retirement income via {t}.', 'Individual', 'Life Insurance', 'Global', ['Whole Life']);
a('Life Insurance', 'Group Life', 'Corporate Life', ['Group Term Life', 'Group Gratuity Life', 'Group Superannuation', 'Group Leave Encashment', 'Employer-Employee Life Scheme', 'Keyman Insurance', 'Partnership Life Insurance'], 'Corporate coverage via {t}.', 'Business', 'Life Insurance', 'Global', ['Term Life']);
a('Life Insurance', 'Specialized Life', 'Niche', ['Final Expense Insurance', 'Burial Insurance', 'Over 50s Guaranteed Life', 'HIV Care Life Insurance', 'Cancer Survivor Life Insurance', 'Special Needs Child Life Trust'], 'Niche life coverage via {t}.', 'Individual', 'Life Insurance', 'Global', ['Term Life']);

// 2. Health Insurance (54 items - expanded)
a('Health Insurance', 'Individual Health', 'Basic Medical', ['Comprehensive Individual Health Coverage', 'Basic Hospitalization Health Insurance', 'Major Medical Health Insurance', 'Catastrophic Health Insurance', 'Short-Term Medical Insurance', 'Global Health Coverage (Worldwide)', 'Ayush Treatment Cover'], '{t} for individuals covering illness and accidents.', 'Individual', 'Health Insurance', 'Global', ['Family Floater']);
a('Health Insurance', 'Family Health', 'Floater Plans', ['Nuclear Family Floater Health Insurance', 'Extended Family Floater Health Insurance', 'Multi-Generation Family Health Insurance'], '{t} covering entire family under one sum.', 'Individual', 'Health Insurance', 'Global', ['Individual Health']);
a('Health Insurance', 'Senior Citizen Health', 'Elderly Care', ['Senior Citizen Standard Health Plan', 'Senior Citizen Comprehensive Plan', 'Pre-existing Disease Covered Senior Plan', 'Red Carpet Senior Health Cover'], '{t} tailored for older demographics.', 'Individual', 'Health Insurance', 'Global', ['Individual Health']);
a('Health Insurance', 'Critical Illness', 'Dread Disease', ['Cancer Specific Health Insurance', 'Cardiac Specific Health Insurance', 'Kidney Failure Health Insurance', 'Comprehensive Critical Illness Cover (30+ diseases)', 'Women Specific Critical Illness Cover'], 'Lump sum payout for {t}.', 'Individual', 'Health Insurance', 'Global', ['Hospital Cash']);
a('Health Insurance', 'Disease Specific', 'Targeted Medical', ['Diabetes Specific Health Cover', 'Asthma Specific Health Cover', 'Autism Support Health Insurance', 'Gender Reassignment Surgery Cover', 'Dengue Care Insurance', 'Malaria Care Insurance', 'Vector-borne Disease Insurance', 'Pandemic (COVID-19) Specific Insurance'], '{t} covering specific ongoing needs or threats.', 'Individual', 'Health Insurance', 'India/Global', ['Critical Illness']);
a('Health Insurance', 'Maternity & Child', 'Pregnancy', ['Comprehensive Maternity Health Insurance', 'Newborn Baby Health Cover', 'IVF Treatment Insurance', 'Congenital Disability Cover'], '{t} related expenses.', 'Individual', 'Health Insurance', 'Global', ['Family Floater']);
a('Health Insurance', 'Top-Up Health', 'Supplementary', ['Standard Top-Up Health Insurance', 'Super Top-Up Health Insurance', 'Deductible Reimbursement Health Cover'], '{t} for extending base policy limits.', 'Individual', 'Health Insurance', 'Global', ['Individual Health']);
a('Health Insurance', 'Specialty Health', 'Niche Medical', ['Dental Insurance', 'Vision Insurance', 'Hearing Aid Insurance', 'Psychiatric & Mental Health Cover', 'Bariatric Surgery Cover', 'Cosmetic Reconstructive Surgery Cover'], '{t} for specific ongoing or niche care.', 'Individual', 'Health Insurance', 'Global', ['Individual Health']);
a('Health Insurance', 'Group Health', 'Employee Benefits', ['Group Health Floater Plan', 'Corporate GMC (Group Mediclaim Policy)', 'Group Maternity Cover', 'Group Critical Illness Plan', 'Group OPD Cover', 'Corporate Wellness Insurance'], '{t} for corporate staff.', 'Business', 'Health Insurance', 'Global', ['Group Life']);
a('Health Insurance', 'Outpatient (OPD)', 'Day-to-day Care', ['Comprehensive OPD Insurance', 'Telemedicine Consultation Insurance', 'Pharmacy Benefit Insurance', 'Diagnostic Test Insurance'], '{t} for non-hospitalization expenses.', 'Individual', 'Health Insurance', 'Global', ['Individual Health']);

// 3. Personal Insurance (19 items)
a('Personal Insurance', 'Personal Accident', 'Basic PA', ['Individual Personal Accident Cover', 'Family Personal Accident Cover', 'Group Personal Accident (GPA) Cover', 'Student Personal Accident Cover', 'Rail/Air Passenger Accident Cover'], '{t} for accidental death or disability.', 'Individual/Business', 'General Insurance', 'Global', ['Health Insurance', 'Life Insurance']);
a('Personal Insurance', 'Disability Insurance', 'Income Protection', ['Short-Term Disability Insurance', 'Long-Term Disability Insurance', 'Permanent Total Disability (PTD) Insurance', 'Temporary Total Disability (TTD) Insurance', 'Specific Loss Disability Insurance'], '{t} replacing lost income due to incapacitation.', 'Individual', 'General/Health Insurance', 'Global', ['Personal Accident']);
a('Personal Insurance', 'Income Replacement', 'Redundancy', ['Loss of Job Insurance', 'Involuntary Unemployment Insurance', 'Mortgage Payment Protection Insurance', 'Loan EMI Protection Insurance'], '{t} supporting financial obligations during job loss.', 'Individual', 'General Insurance', 'Global', ['Disability Insurance']);
a('Personal Insurance', 'Identity & Legal', 'Protection', ['Identify Theft Insurance', 'Personal Legal Expense Insurance', 'Family Defense Insurance', 'Card Protection Liability Insurance', 'Cyber Bullying Extortion Insurance'], '{t} covering legal and recovery fees.', 'Individual', 'General Insurance', 'Global', ['Cyber Insurance']);

// 4. Property Insurance (35 items)
a('Property Insurance', 'Home Building', 'Structural', ['Standard Fire and Special Perils (Home)', 'Bharat Griha Raksha Policy', 'Home Structure Replacement Cost Insurance', 'Heritage Home Insurance', 'Under-Construction Home Insurance'], '{t} covering the physical building.', 'Individual', 'General Insurance', 'Global', ['Home Contents']);
a('Property Insurance', 'Home Contents', 'Belongings', ['Home Belongings Insurance', 'Electronic Appliances Breakdown Cover', 'Jewelry and Valuables Insurance', 'Fine Art Personal Insurance', 'Portable Equipment Cover'], '{t} protecting personal possessions inside the home.', 'Individual', 'General Insurance', 'Global', ['Home Building']);
a('Property Insurance', 'Renters & Landlord', 'Tenancy', ['Renters Contents Liability Insurance', 'Landlord Fixtures and Fittings Cover', 'Loss of Rent Insurance', 'Tenant Default Insurance', 'Landlord Public Liability Insurance'], '{t} addressing specific renting risks.', 'Individual', 'General Insurance', 'Global', ['Home Contents']);
a('Property Insurance', 'Natural Disaster', 'Catastrophe', ['Earthquake Insurance', 'Flood and Inundation Insurance', 'Cyclone and Storm Insurance', 'Subsidence & Landslide Insurance', 'Volcanic Eruption Insurance'], '{t} specific to geographical catastrophic risks.', 'Individual', 'General Insurance', 'Global', ['Home Building']);
a('Property Insurance', 'Commercial Property', 'Business Assets', ['Commercial Standard Fire and Special Perils', 'Bharat Sookshma Udyam Suraksha', 'Bharat Laghu Udyam Suraksha', 'Commercial All Risk Property Insurance', 'Industrial All Risk (IAR) Insurance'], '{t} for commercial premises.', 'Business', 'General Insurance', 'Global', ['Business Interruption']);
a('Property Insurance', 'Specialized Property', 'Niche Assets', ['Mobile Home Insurance', 'Vacant Property Insurance', 'Short-Term Rental (Airbnb) Property Insurance', 'Farm Building Insurance', 'Historic Building Commercial Insurance'], '{t} for non-standard property arrangements.', 'Individual/Business', 'General Insurance', 'Global', ['Home Building']);
a('Property Insurance', 'Transit Property', 'Moving', ['Household Goods Transit Insurance', 'Baggage Insurance', 'Packers and Movers Insurance', 'Storage Unit Insurance'], '{t} protecting goods moving locations.', 'Individual', 'General Insurance', 'Global', ['Marine Cargo']);

// 5. Motor & Transportation Insurance (40 items - expanded)
a('Motor & Transportation Insurance', 'Private Car', 'Retail Auto', ['Comprehensive Car Insurance', 'Third-Party Liability Car Insurance', 'Stand-alone Own Damage Car Insurance', 'Pay-As-You-Drive (PAYD) Car Insurance', 'Pay-How-You-Drive (PHYD) Car Insurance'], '{t} for personal four-wheelers.', 'Individual', 'General Insurance', 'Global', ['Commercial Vehicle']);
a('Motor & Transportation Insurance', 'Two-Wheeler', 'Motorcycle/Scooter', ['Comprehensive Two-Wheeler Insurance', 'Third-Party Liability Two-Wheeler Insurance', 'Multi-Year Long Term Two-Wheeler Insurance', 'High-End Superbike Insurance', 'Electric Scooter Specialized Insurance'], '{t} for personal two-wheelers.', 'Individual', 'General Insurance', 'Global', ['Private Car']);
a('Motor & Transportation Insurance', 'Recreational Vehicles', 'Specialty Auto', ['Motorhome/RV Insurance', 'Caravan Insurance', 'Classic Motorcycle Insurance', 'Off-Road ATV Insurance', 'Snowmobile Insurance', 'Golf Cart Insurance', 'Personal Transporter (Segway) Insurance', 'E-bike / Pedelec Insurance'], '{t} for niche personal mobility.', 'Individual', 'General Insurance', 'Global', ['Private Car']);
a('Motor & Transportation Insurance', 'Commercial Vehicle', 'Business Transport', ['Goods Carrying Vehicle Insurance', 'Passenger Carrying Vehicle Insurance', 'Taxi/Cab Fleet Insurance', 'School Bus Insurance', 'Heavy Commercial Vehicle (HCV) Insurance', 'Light Commercial Vehicle (LCV) Insurance'], '{t} for business-owned transport.', 'Business', 'General Insurance', 'Global', ['Fleet Insurance']);
a('Motor & Transportation Insurance', 'Electric Vehicle (EV)', 'EV Auto', ['EV Battery Replacement Insurance', 'EV Charging Equipment Liability Cover', 'Comprehensive EV Car Insurance', 'Comprehensive EV Commercial Vehicle Insurance'], '{t} specific to electric motor needs.', 'Individual/Business', 'General Insurance', 'Global', ['Private Car']);
a('Motor & Transportation Insurance', 'Fleet & Logistics', 'Corporate Transport', ['Corporate Motor Fleet Insurance', 'Logistics Aggregator Insurance', 'Rent-a-Car Fleet Insurance', 'Ride-Sharing Driver Contingency Insurance', 'Food Delivery Rider Insurance', 'Last-Mile Delivery Fleet Cover'], '{t} covering bulk vehicles.', 'Business', 'General Insurance', 'Global', ['Commercial Vehicle']);
a('Motor & Transportation Insurance', 'Motor Add-Ons', 'Supplementary Auto', ['Zero Depreciation (Bumper to Bumper) Cover', 'Engine Protection Cover', 'Return to Invoice (RTI) Cover', 'NCB Protector Cover', 'Consumables Cover', 'Key Replacement Cover'], '{t} extending base auto policy.', 'Individual', 'General Insurance', 'Global', ['Private Car']);

// 6. Marine Insurance (26 items - expanded)
a('Marine Insurance', 'Marine Cargo', 'Goods in Transit', ['Specific Voyage Cargo Insurance', 'Open Cover Marine Insurance', 'Sales Turnover Policy (STOP)', 'Export/Import Marine Cargo Insurance', 'Inland Transit Insurance (Rail/Road)', 'Multi-Modal Logistics Insurance'], '{t} protecting shipped goods.', 'Business', 'General Insurance', 'Global', ['Marine Hull']);
a('Marine Insurance', 'Marine Hull', 'Vessel Damage', ['Hull and Machinery (H&M) Insurance', 'Loss of Hire Marine Insurance', 'Ship Repairers Liability Insurance', 'Port Risks Insurance', 'Total Loss Only (TLO) Marine Cover', 'Vessel Construction Risk Cover'], '{t} protecting the physical vessel.', 'Business/Industrial', 'General Insurance', 'Global', ['Marine Cargo', 'Aviation Insurance']);
a('Marine Insurance', 'Marine Liability', 'Maritime Legal', ['Protection and Indemnity (P&I) Insurance', 'Freight Demurrage and Defense (FD&D) Insurance', 'Terminal Operators Liability Insurance', 'Stevedores Liability Insurance', 'Charterers Liability Insurance'], '{t} for maritime legal liabilities.', 'Business/Industrial', 'General Insurance', 'Global', ['General Liability']);
a('Marine Insurance', 'Specialized Marine', 'Niche Maritime', ['Yacht and Pleasure Craft Insurance', 'Fishing Vessel Insurance', 'Offshore Oil Rig Marine Insurance', 'Subsea Equipment Insurance', 'Marine Piracy and Kidnap Insurance', 'Builder’s Risk (Marine) Insurance', 'Cruise Ship Fleet Insurance', 'Superyacht Comprehensive Policy', 'Marina Keepers Liability Insurance'], '{t} for specific aquatic operations.', 'Business/Industrial', 'General Insurance', 'Global', ['Marine Hull']);

// 7. Aviation Insurance (17 items - expanded)
a('Aviation Insurance', 'Aircraft Hull', 'Aviation Assets', ['Commercial Airliner Hull Insurance', 'General Aviation Hull Insurance', 'Helicopter Hull Insurance', 'In-Flight Damage Insurance', 'Ground Risk Hull (Not In Motion) Insurance', 'Aerospace Testing Hull Cover'], '{t} protecting flying assets.', 'Business/Industrial', 'General Insurance', 'Global', ['Marine Hull']);
a('Aviation Insurance', 'Aviation Liability', 'Aviation Legal', ['Passenger Legal Liability Insurance', 'Third-Party Legal Liability (Aviation) Insurance', 'Airport Operators Liability Insurance', 'Aviation Products Liability Insurance', 'Hangar Keepers Liability Insurance', 'Air Traffic Control Errors & Omissions'], '{t} covering aviation-related damages.', 'Business/Industrial', 'General Insurance', 'Global', ['General Liability']);
a('Aviation Insurance', 'Space & Satellite', 'Orbital', ['Satellite Launch Insurance', 'In-Orbit Satellite Life Insurance', 'Space Payload Integrity Insurance', 'Reusable Launch Vehicle Insurance', 'Space Debris Collision Liability'], '{t} covering space missions.', 'Industrial', 'General Insurance', 'Global', ['Aviation Hull']);

// 8. Travel Insurance (28 items - expanded)
a('Travel Insurance', 'International Travel', 'Overseas Trip', ['Single Trip International Insurance', 'Annual Multi-Trip International Insurance', 'Schengen Visa Compliant Travel Insurance', 'Worldwide (Excluding USA/Canada) Travel Cover', 'Worldwide (Including USA/Canada) Travel Cover', 'Expatriate Travel Insurance', 'Digital Nomad Annual Cover'], '{t} for cross-border journeys.', 'Individual/Business', 'General/Health Insurance', 'Global', ['Domestic Travel']);
a('Travel Insurance', 'Domestic Travel', 'In-Country Trip', ['Single Trip Domestic Insurance', 'Domestic Flight Cancellation Insurance', 'Train Journey Insurance', 'Bus Commuter Insurance'], '{t} for travel within homeland.', 'Individual', 'General Insurance', 'India/Global', ['International Travel']);
a('Travel Insurance', 'Demographic Travel', 'Targeted Trip', ['Senior Citizen Travel Insurance', 'Student (Study Abroad) Travel Insurance', 'Corporate Frequent Flyer Insurance', 'Family Group Travel Insurance', 'Backpacker Insurance'], '{t} tailored to specific traveler profiles.', 'Individual/Business', 'General/Health Insurance', 'Global', ['International Travel']);
a('Travel Insurance', 'Specialty Travel', 'Niche Trip', ['Cruise Travel Insurance', 'Winter Sports Travel Insurance', 'Golf Equipment Travel Insurance', 'Scuba Diving / Extreme Sports Travel Cover'], '{t} for specific leisure activities.', 'Individual', 'General Insurance', 'Global', ['Personal Accident']);
a('Travel Insurance', 'Travel Contingency', 'Trip Disruption', ['Trip Cancellation and Interruption Insurance', 'Baggage Delay/Loss Insurance', 'Passport/Document Loss Insurance', 'Bounced Booking/Hotel Cancellation Cover', 'Emergency Medical Evacuation Cover', 'Adventure Sports Travel Add-on', 'Repatriation of Mortal Remains Cover', 'Rental Car Excess Insurance', 'Missed Connection Insurance'], '{t} handling specific trip failures.', 'Individual', 'General Insurance', 'Global', ['Personal Accident']);

// 9. Agriculture Insurance (18 items)
a('Agriculture Insurance', 'Crop Insurance', 'Farming', ['Yield-Based Crop Insurance', 'Weather-Based Crop Insurance (WBCIS)', 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', 'Named Peril Crop Insurance', 'Multi-Peril Crop Insurance (MPCI)', 'Greenhouse Crop Insurance'], '{t} protecting yield and farming income.', 'Business/Individual', 'General Insurance', 'Global/India', ['Weather Insurance']);
a('Agriculture Insurance', 'Livestock & Animal', 'Husbandry', ['Cattle/Bovine Insurance', 'Poultry Farm Insurance', 'Sheep and Goat Insurance', 'Stud Farm/Horse Insurance', 'Pig Farming Insurance', 'Silkworm/Sericulture Insurance'], '{t} protecting animal assets.', 'Business/Individual', 'General Insurance', 'Global', ['Pet Insurance']);
a('Agriculture Insurance', 'Agri-Business', 'Farm Operations', ['Agricultural Machinery/Tractor Insurance', 'Farm Building and Storage Insurance', 'Aquaculture and Fisheries Insurance', 'Forestry and Timber Insurance', 'Agricultural Input (Seeds/Fertilizer) Transit Insurance', 'Floriculture Insurance'], '{t} for comprehensive agricultural enterprise protection.', 'Business', 'General Insurance', 'Global', ['Commercial Property']);

// 10. Environmental Insurance (8 items)
a('Environmental Insurance', 'Pollution Liability', 'Eco Legal', ['Contractors Pollution Liability', 'Premises Pollution Liability', 'Environmental Impairment Liability', 'Underground Storage Tank Liability'], '{t} for ecological contamination claims.', 'Industrial/Business', 'General Insurance', 'Global', ['General Liability']);
a('Environmental Insurance', 'Climate & Weather', 'Parametric', ['Parametric Weather Insurance', 'Carbon Credit Invalidation Insurance', 'Forest Fire Specific Liability', 'Drought Relief Parametric Cover'], '{t} addressing systemic ecological shifts.', 'Business/Industrial', 'General Insurance', 'Global', ['Agriculture Insurance']);

// 11. Business Insurance (25 items)
a('Business Insurance', 'SME & Corporate', 'Package Policies', ['Business Owner’s Policy (BOP)', 'Shopkeeper’s Comprehensive Policy', 'Office Package Policy', 'Startup Protection Package', 'Restaurant & Hospitality Comprehensive Insurance'], '{t} providing bundled commercial coverage.', 'Business', 'General Insurance', 'Global', ['Commercial Property']);
a('Business Insurance', 'Business Interruption', 'Revenue Protection', ['Standard Business Interruption Policy', 'Contingent Business Interruption (CBI)', 'Supply Chain Interruption Insurance', 'Loss of Profit (Fire) Policy', 'Pandemic Business Interruption Cover'], '{t} keeping businesses liquid during forced closures.', 'Business', 'General Insurance', 'Global', ['Commercial Property']);
a('Business Insurance', 'Trade & Supply Chain', 'Commercial Output', ['Trade Credit Insurance', 'Export Credit Guarantee Insurance', 'Customs Bond Insurance', 'Warehouse to Warehouse Supply Chain Cover', 'Vendor Defect Replacement Cover'], '{t} securing B2B transactions and logistics.', 'Business', 'General Insurance', 'Global', ['Marine Cargo', 'Credit Insurance']);
a('Business Insurance', 'Human Resources', 'Employee Fidelity', ['Fidelity Guarantee Insurance', 'Employee Dishonesty Cover', 'Employment Practices Liability Insurance (EPLI)', 'Key Person Disability Insurance', 'Workplace Violence/Kidnap Response Insurance'], '{t} protecting against staff-related risks.', 'Business', 'General Insurance', 'Global', ['General Liability']);
a('Business Insurance', 'Specific Assets', 'Corporate Property', ['Neon Sign & Hoarding Insurance', 'Plate Glass Insurance', 'Money in Transit / Safe Insurance', 'Corporate Fine Art Cover', 'Exhibition and Event Asset Insurance'], '{t} covering specific physical business assets.', 'Business', 'General Insurance', 'Global', ['Commercial Property']);

// 12. Liability Insurance (16 items)
a('Liability Insurance', 'General Liability', 'Public Legal', ['Commercial General Liability (CGL)', 'Public Liability (Act) Policy', 'Public Liability (Non-Act/Industrial) Policy', 'Umbrella Liability Insurance', 'Excess Liability Insurance'], '{t} covering broad third-party legal claims.', 'Business', 'General Insurance', 'Global', ['Professional Liability']);
a('Liability Insurance', 'Product Liability', 'Manufacturing Legal', ['Product Liability Insurance', 'Product Recall Insurance', 'Completed Operations Liability Insurance', 'Defective Product Contamination Insurance'], '{t} dealing with harm caused by sold goods.', 'Business/Industrial', 'General Insurance', 'Global', ['General Liability']);
a('Liability Insurance', 'Specialized Liability', 'Niche Legal', ['Directors and Officers (D&O) Liability', 'Errors and Omissions (E&O) Insurance', 'Media Liability Insurance', 'Publisher’s Defamation Liability', 'Liquor Liability Insurance', 'Garage Keeper’s Legal Liability', 'Clinical Trials Liability Insurance'], '{t} for unique corporate exposure architectures.', 'Business', 'General Insurance', 'Global', ['Professional Liability']);

// 13. Professional Insurance (20 items - expanded)
a('Professional Insurance', 'Medical Malpractice', 'Healthcare Legal', ['Medical Practitioner Indemnity Insurance', 'Hospital / Clinic Professional Liability', 'Surgeon Specific Malpractice Cover', 'Dental Malpractice Insurance', 'Pharmacist Errors & Omissions Cover', 'Veterinary Malpractice Insurance'], '{t} protecting healthcare operators from litigation.', 'Business/Professional', 'General Insurance', 'Global', ['General Liability']);
a('Professional Insurance', 'Consulting & Legal', 'Advisory Legal', ['Lawyer/Attorney Professional Indemnity', 'CA/Accountant Professional Indemnity', 'Architect & Engineer Professional Liability', 'IT Consultant Professional Indemnity', 'Real Estate Agent E&O Insurance', 'Financial Advisor E&O Cover', 'Management Consultant Liability'], '{t} defending knowledge-based professionals from error claims.', 'Professional', 'General Insurance', 'Global', ['General Liability']);
a('Professional Insurance', 'Contractor Liability', 'Tradesman Legal', ['Construction Contractor E&O', 'Plumber/Electrician Public Liability', 'Handyman Liability Insurance', 'HVAC Contractor Liability', 'Landscaping Business Liability', 'Roofing Contractor Premium Liability', 'Demolition Specialist Liability'], '{t} for physical trade service providers.', 'Professional', 'General Insurance', 'Global', ['General Liability']);

// 14. Industrial Insurance (14 items)
a('Industrial Insurance', 'Engineering & Projects', 'Construction', ['Contractor’s All Risk (CAR) Policy', 'Erection All Risk (EAR) Policy', 'Advance Loss of Profit (ALOP) Insurance', 'Delay in Start-Up (DSU) Insurance'], '{t} covering major builds and assemblies.', 'Industrial', 'General Insurance', 'Global', ['Commercial Property']);
a('Industrial Insurance', 'Machinery & Equipment', 'Plant Assets', ['Machinery Breakdown Policy (MBP)', 'Boiler and Pressure Plant Insurance', 'Contractor’s Plant and Machinery (CPM) Policy', 'Deterioration of Stock (Cold Storage) Insurance', 'Electronic Equipment Insurance (EEI)'], '{t} protecting heavy commercial plant infrastructure.', 'Industrial', 'General Insurance', 'Global', ['Commercial Property']);
a('Industrial Insurance', 'Industrial Operations', 'Sector Specific', ['Mining Operations Risk Policy', 'Chemical Plant Comprehensive Insurance', 'Metallurgical Plant All Risk Cover', 'Textile Mill Comprehensive Cover', 'Heavy Manufacturing All Risk'], '{t} tailored to major industrial sectors.', 'Industrial', 'General Insurance', 'Global', ['Business Interruption']);

// 15. Financial Insurance (12 items)
a('Financial Insurance', 'Banking & Finance', 'Institutional Risk', ['Banker’s Blanket Bond (BBB)', 'Financial Institutions Professional Indemnity', 'Electronic Computer Crime (ECC) Insurance', 'Safe Deposit Box Insurance', 'Cash in Vault Protection Insurance'], '{t} covering systemic financial institution risks.', 'Institution', 'General Insurance', 'Global', ['Fidelity Guarantee']);
a('Financial Insurance', 'Investment Risk', 'Capital Protection', ['Title Insurance', 'Political Risk Insurance', 'Foreign Direct Investment (FDI) Insurance', 'Currency Convertibility Risk Insurance', 'Mergers & Acquisitions (M&A) Reps & Warranties Insurance', 'Tax Liability Mitigation Insurance', 'Aborted Bid Cover'], '{t} securing institutional level transactions and assets.', 'Institution/Corporate', 'General Insurance', 'Global', ['Credit Insurance']);

// 16. Credit Insurance (10 items)
a('Credit Insurance', 'Trade Credit', 'Commercial Debt', ['Whole Turnover Trade Credit Insurance', 'Key Account / Single Buyer Credit Insurance', 'Export Credit Receivable Insurance', 'Domestic Trade Credit Cover', 'Excess of Loss Credit Insurance'], '{t} covering default on business receivables.', 'Business', 'General Insurance', 'Global', ['Trade Supply Chain']);
a('Credit Insurance', 'Consumer Credit', 'Personal Debt', ['Credit Card Balance Insurance', 'Mortgage Default Guaranty Insurance', 'Auto Loan Default Insurance', 'Personal Loan Protection Cover', 'Retail Installment Credit Insurance'], '{t} protecting lenders or borrowers on consumer debt defaults.', 'Institution/Individual', 'General Insurance', 'Global', ['Income Replacement']);

// 17. Technology & Cyber Insurance (28 items - expanded)
a('Technology & Cyber Insurance', 'Cyber Security (Corporate)', 'Digital Legal', ['First-Party Cyber Breach Response Cover', 'Third-Party Network Security Liability', 'Cyber Extortion & Ransomware Insurance', 'Data Breach Liability Cover', 'PCI DSS Fines & Penalties Cover', 'Social Engineering Fraud Insurance', 'System Failure Business Interruption Cover', 'Cyber Reputation Harm Insurance', 'Cryptojacking Legal Cover', 'Cloud Outage / Infrastructure Failure Insurance'], '{t} for corporate networks facing digital attacks.', 'Business', 'General Insurance', 'Global', ['Business Interruption', 'General Liability']);
a('Technology & Cyber Insurance', 'Cyber Security (Personal)', 'Personal Digital', ['Personal Identity Theft Cover', 'Cyber Bullying & Stalking Insurance', 'Unauthorized Digital Transaction Cover', 'Personal Malware Cleanup Insurance', 'Smart Home Device Hacking Insurance', 'Phishing Specific Loss Cover', 'Deepfake Fraud Liability', 'Cryptocurrency Wallet Insurance', 'NFT Theft Insurance'], '{t} protecting retail individuals from cyber crime.', 'Individual', 'General Insurance', 'Global', ['Identify & Legal Protection']);
a('Technology & Cyber Insurance', 'Tech Specific & AI', 'Emerging Tech Legal', ['AI Algorithmic Bias Liability Insurance', 'Software Defect Liability Cover', 'IoT Manufacturer E&O Insurance', 'Blockchain/Smart Contract Failure Insurance', 'Crypto Asset Theft Insurance', 'Virtual Property / Metaverse Asset Insurance', 'Smart Contract Audit Liability', 'Decentralized Finance (DeFi) Insurance', 'DAO Treasury Insurance'], '{t} covering next-generation tech development and usage.', 'Corporate/Individual', 'General Insurance', 'Global', ['Professional Liability', 'Cyber Security']);

// 18. Energy Insurance (10 items)
a('Energy Insurance', 'Renewable Energy', 'Green Power', ['Solar PV Power Plant Insurance', 'Wind Turbine All Risk Insurance', 'Hydroelectric Project Insurance', 'Biomass Plant Comprehensive Cover', 'Geothermal Power Operations Liability'], '{t} for sustainable power assets.', 'Industrial', 'General Insurance', 'Global', ['Industrial Operations']);
a('Energy Insurance', 'Fossil & Nuclear', 'Traditional Power', ['Oil and Gas Exploration Insurance', 'Offshore Platform/Rig Insurance', 'Petrochemical Plant Liability Cover', 'Coal Mine All Risk Policy', 'Nuclear Energy Liability Insurance'], '{t} protecting heavy energy extraction and processing.', 'Industrial', 'General Insurance', 'Global', ['Marine Insurance', 'Industrial Operations']);

// 19. Infrastructure Insurance (8 items)
a('Infrastructure Insurance', 'Public Works', 'Civic Projects', ['Highway and Toll Road Infrastructure Insurance', 'Bridge and Tunnel All Risk Cover', 'Railway Infrastructure Policy', 'Airport Construction and Operations Cover', 'Port and Harbor Installation Insurance'], '{t} for massive scale civic engineering.', 'Industrial/Government', 'General Insurance', 'Global', ['Engineering & Projects']);
a('Infrastructure Insurance', 'Utility Infrastructure', 'Grid & Pipe', ['Power Grid and Transmission Line Insurance', 'Water Treatment Facility Insurance', 'Telecommunications Network Insurance', 'Sewage Plant Liability Cover', 'Desalination Plant Insurance', 'Landfill / Waste Management Liability', 'District Heating Network Insurance', 'Subsea Cable Infrastructure Cover', 'Smart City Sensor Network Insurance', 'Municipal Broad-band Infrastructure Cover', 'Traffic Control System Insurance', 'Reservoir/Dam Catastrophe Insurance', 'Gas Pipeline Network Liability'], '{t} protecting backbone utility assets.', 'Industrial', 'General Insurance', 'Global', ['Industrial Insurance']);

// 20. Specialty Insurance (24 items - expanded)
a('Specialty Insurance', 'Pet & Animal', 'Companion Health', ['Comprehensive Dog Health Insurance', 'Comprehensive Cat Health Insurance', 'Exotic Pet Insurance', 'Pet Third-Party Liability Cover', 'Pet Theft and Straying Cover', 'Working Dog / Service Animal Insurance', 'Bird Insurance', 'Reptile Insurance', 'Small Mammal Insurance', 'Aquarium Fish Liability', 'Pet Breeder Insurance', 'Pet Boarding Liability'], '{t} for veterinary and liability costs of companions.', 'Individual', 'General Insurance', 'Global', ['Agriculture Livestock']);
a('Specialty Insurance', 'Aviation & Marine Niche', 'Unique Transport', ['Drone / UAV Third-Party Liability Insurance', 'Drone Physical Damage Cover', 'Hot Air Balloon Operators Insurance', 'Submarine / ROV Liability Cover'], '{t} for novel and unmanned transport.', 'Business/Individual', 'General Insurance', 'Global', ['Aviation Insurance']);
a('Specialty Insurance', 'High Net Worth', 'Luxury Assets', ['Kidnap and Ransom (K&R) Insurance', 'Bespoke Art Collection Insurance', 'Classic / Vintage Car Insurance', 'Bloodstock / Racehorse Insurance', 'Private Island Property Insurance', 'Extortion Response Insurance', 'Aviation / Private Jet Liability', 'Yacht Crew Liability'], '{t} tailored for extreme wealth protection.', 'Individual', 'General/Life Insurance', 'Global', ['Property Insurance', 'Personal Insurance']);

// 21. Event & Lifestyle Insurance (12 items)
a('Event & Lifestyle Insurance', 'Events & Weddings', 'Gatherings', ['Wedding Cancellation Insurance', 'Event Public Liability Insurance', 'Concert/Festival Non-Appearance Insurance', 'Exhibition Organizer Cancellation Cover', 'Corporate Event Liability Insurance'], '{t} protecting organizers from disruption and lawsuits.', 'Individual/Business', 'General Insurance', 'Global', ['General Liability', 'Property Insurance']);
a('Event & Lifestyle Insurance', 'Lifestyle & Fame', 'Reputation', ['Celebrity Body Part / Key Talent Insurance', 'Prize Indemnity (Hole-in-one) Insurance', 'Film / Media Production Insurance', 'Reputation/PR Damage Insurance', 'Professional Athlete Career Ending Insurance', 'Influencer Defamation / E&O Insurance', 'Esports Player Disability Insurance'], '{t} for highly specific modern lifestyles and wagers.', 'Business/Individual', 'General Insurance', 'Global', ['Personal Accident', 'Professional Liability']);

// 22. Emerging Insurance Models (17 items)
a('Emerging Insurance Models', 'Algorithmic & Parametric', 'Data Driven', ['Parametric Flight Delay Insurance', 'Parametric Hurricane Coverage', 'Algorithmic Crop Drought Insurance', 'Parametric Blockchain Transaction Delay Cover', 'Parametric Earthquake Auto-Payout Cover'], '{t} executing automatically via smart contracts and data oracles.', 'Individual/Business', 'General Insurance', 'Global', ['Environmental Insurance']);
a('Emerging Insurance Models', 'Usage-Based (UBI)', 'On-Demand', ['Pay-As-You-Drive (PAYD) Motor Insurance', 'Pay-How-You-Drive (PHYD) Telematics Cover', 'On-Demand Micro-Trip Insurance', 'Gig Economy Worker Hourly Liability', 'Short-Term Equipment Rental Insurance'], '{t} dynamically pricing risk based on real-time behavior.', 'Individual/Business', 'General Insurance', 'Global', ['Motor Insurance']);
a('Emerging Insurance Models', 'Embedded & Platform', 'Integrated', ['E-commerce Return Shipping Insurance', 'Embedded Ride-Share Passenger Cover', 'Embedded Ticket Cancellation Cover', 'Point-of-Sale Gadget Extended Warranty', 'Embedded Travel Wallet Protection'], '{t} bundled invisibly into digital purchases.', 'Individual', 'General Insurance', 'Global', ['Travel Insurance', 'Personal Insurance']);
a('Emerging Insurance Models', 'Futuristic', 'Frontier Risks', ['Space Tourism Passenger Liability', 'Artificial Intelligence Entity Liability', 'Asteroid/Meteor Strike Property Cover'], '{t} anticipating next century technological and celestial risks.', 'Individual/Corporate', 'General/Specialty Insurance', 'Global', ['Aviation Space', 'Technology & Cyber']);


// Generate outputs
const total = DB.length;
console.log("Total unique insurance types generated:", total);

// FORMAT A: Hierarchical Tree
let treeOutput = `# Insurance Mega Database Hierarchy\n\n`;
let currentSector = '';
let currentCat = '';
let currentSub = '';

DB.forEach(item => {
    if (item.sector !== currentSector) {
        currentSector = item.sector;
        treeOutput += `\n## ${currentSector}\n`;
        currentCat = '';
    }
    if (item.category !== currentCat) {
        currentCat = item.category;
        treeOutput += `### ↳ ${currentCat}\n`;
        currentSub = '';
    }
    if (item.subcategory !== currentSub) {
        currentSub = item.subcategory;
        treeOutput += `#### ↳ ${currentSub}\n`;
    }
    treeOutput += `- ${item.name}\n`;
});

fs.writeFileSync(path.join(ARTIFACT_DIR, 'insurance_taxonomy_tree.md'), treeOutput);

// FORMAT B: Master Insurance Table
let tableOutput = `# Insurance Master Database Table\n\n`;
tableOutput += `| ID | Insurance Type | Sector | Category | Description | Users | IRDAI Class | Global Use |\n`;
tableOutput += `|---|---|---|---|---|---|---|---|\n`;

DB.forEach(item => {
    tableOutput += `| ${item.id} | **${item.name}** | ${item.sector} | ${item.category} | ${item.description} | ${item.users} | ${item.irdaiClass} | ${item.globalUse} |\n`;
});

fs.writeFileSync(path.join(ARTIFACT_DIR, 'insurance_master_table.md'), tableOutput);

// FORMAT C: Knowledge Graph Relationships
let kgOutput = `# Insurance Knowledge Graph Relationships\n\n`;
kgOutput += `This document maps the localized nodes and directed relationships for all ${total} insurance entries.\n\n`;

let sectorGroups = {};
DB.forEach(item => {
    if (!sectorGroups[item.sector]) sectorGroups[item.sector] = {};
    if (!sectorGroups[item.sector][item.category]) sectorGroups[item.sector][item.category] = [];
    sectorGroups[item.sector][item.category].push(item);
});

Object.keys(sectorGroups).forEach(sector => {
    kgOutput += `\n## Node: [${sector}]\n`;
    Object.keys(sectorGroups[sector]).forEach(cat => {
        kgOutput += `### ↳ [${cat}]\n`;
        let items = sectorGroups[sector][cat];
        kgOutput += `→ **includes_products**:\n`;
        items.forEach(i => {
            kgOutput += `    - ${i.name}\n`;
        });

        // aggregate related types / metadata
        let relatedSet = new Set();
        let usersSet = new Set();
        items.forEach(i => {
            i.related.split(', ').forEach(r => relatedSet.add(r));
            i.users.split('/').forEach(u => usersSet.add(u));
        });

        kgOutput += `→ **related_to**:\n`;
        Array.from(relatedSet).forEach(r => kgOutput += `    - [${r}]\n`);

        kgOutput += `→ **used_by**:\n`;
        Array.from(usersSet).forEach(u => kgOutput += `    - [${u}]\n`);
    });
});

fs.writeFileSync(path.join(ARTIFACT_DIR, 'insurance_knowledge_graph.md'), kgOutput);

// FORMAT D: JSON For Next.js App Directory
const SITE_DATA_DIR = path.join(__dirname, '../src/data');
if (!fs.existsSync(SITE_DATA_DIR)) {
    fs.mkdirSync(SITE_DATA_DIR, { recursive: true });
}
fs.writeFileSync(path.join(SITE_DATA_DIR, 'mega-database.json'), JSON.stringify(DB, null, 2));

console.log("DB artifacts successfully written. Total:", total);
