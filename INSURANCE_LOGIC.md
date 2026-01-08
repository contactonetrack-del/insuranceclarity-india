# Insurance Business Logic Documentation

## Overview

This document explains the core insurance-related business logic implemented in InsuranceClarity India.

## Insurance Categories

| Category | Route | Description |
|----------|-------|-------------|
| Life Insurance | `/insurance/life` | Term, Whole Life, ULIPs |
| Health Insurance | `/insurance/health` | Individual, Family, Critical Illness |
| Motor Insurance | `/insurance/motor` | Car, Bike, Comprehensive |
| Home Insurance | `/insurance/home` | Building, Contents, Fire |
| Travel Insurance | `/insurance/travel` | Domestic, International |
| Personal Accident | `/insurance/personal-accident` | Accidental death/disability |
| Specialized | `/insurance/specialized` | Pet, Wedding, Gadget |

## Core Features

### 1. Hidden Facts Revealer

**Purpose**: Expose exclusions and fine print that insurers don't prominently display.

**Data Structure**:

```typescript
interface HiddenFact {
  id: string;
  category: InsuranceCategory;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedClaims: string[];
}
```

### 2. Premium Calculator

**Purpose**: Estimate insurance premiums based on user inputs.

**Key Factors**:

- **Life**: Age, Sum Insured, Term, Smoker status
- **Health**: Age, Family size, Pre-existing conditions
- **Motor**: Vehicle age, IDV, No-claim bonus

### 3. Policy Comparison

**Purpose**: Side-by-side comparison of policy features.

**Comparison Criteria**:

- Premium amount
- Coverage limits
- Claim settlement ratio
- Waiting periods
- Exclusions

### 4. Claim Cases

**Purpose**: Real-world claim scenarios for user education.

**Case Structure**:

```typescript
interface ClaimCase {
  id: string;
  category: InsuranceCategory;
  title: string;
  scenario: string;
  outcome: 'approved' | 'rejected' | 'partial';
  reason: string;
  lesson: string;
}
```

## Analytics Events

| Event | When Tracked | Data Captured |
|-------|--------------|---------------|
| `policy_comparison_viewed` | User compares policies | Category, count |
| `calculator_used` | User runs calculation | Type, inputs, completed |
| `hidden_fact_revealed` | User views hidden fact | Fact ID, category |
| `claim_case_viewed` | User reads case study | Case ID, outcome |
| `form_abandon` | User leaves form | Form name, step, field |

## PII Handling

**Masked Fields** (never logged in full):

- Aadhaar Number → `12XXXXXX9012`
- PAN Number → `XXXXX234F`
- Policy Number → `XX-XXXX-3456`
- Email → `jo***@example.com`
- Phone → `******3210`

## Regulatory Considerations

- **IRDAI Compliance**: All policy information must be accurate
- **Data Protection**: PII masking mandatory in all logs
- **Transparency**: Must disclose affiliate relationships
