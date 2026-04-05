export interface IridaiRuleChunk {
    id: string;
    title: string;
    keywords: string[];
    content: string;
    source: string;
}

export const IRDAI_RULE_CHUNKS: IridaiRuleChunk[] = [
    {
        id: 'irdai-health-ped-2026',
        title: 'Pre-existing Disease Waiting Period Cap',
        keywords: ['pre-existing', 'ped', 'waiting period', 'health', 'claim rejection'],
        content:
            'IRDAI health insurance norms cap the pre-existing disease waiting period at 36 months for standard retail health products. Policies with longer PED waits should be treated as high risk.',
        source: 'IRDAI Health Insurance Master Circular (2026)',
    },
    {
        id: 'irdai-claim-turnaround',
        title: 'Claim Settlement Turnaround',
        keywords: ['claim', 'settlement', 'turnaround', 'timeline', 'delay'],
        content:
            'Insurers are expected to process complete claim files within defined turnaround windows. Delayed settlements may be escalated through insurer grievance channels and Insurance Ombudsman.',
        source: 'IRDAI Protection of Policyholders Interests Regulations',
    },
    {
        id: 'irdai-room-rent-sub-limit',
        title: 'Room Rent Sub-limit Risk',
        keywords: ['room rent', 'sub-limit', 'proportionate deduction', 'hospital'],
        content:
            'Room rent caps can trigger proportionate deductions across the hospitalization bill, not just room charges. Policies without room-rent sub-limits generally reduce claim disputes.',
        source: 'IRDAI Product Filing Guidance + Public Insurer Wordings',
    },
    {
        id: 'irdai-free-look',
        title: 'Free-Look Cancellation Window',
        keywords: ['free look', 'cancel', 'refund', 'policy issuance'],
        content:
            'Most life and health policies include a free-look period after receiving policy documents. Customers can cancel within this period subject to insurer deductions allowed by regulation.',
        source: 'IRDAI Policyholder Rights Framework',
    },
    {
        id: 'irdai-grievance-escalation',
        title: 'Grievance Escalation Path',
        keywords: ['complaint', 'grievance', 'ombudsman', 'bima bharosa', 'rejected claim'],
        content:
            'When insurer support does not resolve disputes, policyholders can escalate to Insurance Ombudsman and lodge complaints on Bima Bharosa (IRDAI grievance platform).',
        source: 'IRDAI Grievance Redressal Process',
    },
    {
        id: 'irdai-disclosure-duty',
        title: 'Material Disclosure Requirement',
        keywords: ['disclosure', 'proposal form', 'non-disclosure', 'misrepresentation'],
        content:
            'Material non-disclosure in proposal forms can be used to repudiate claims. Users should accurately disclose medical, lifestyle, and financial details at policy purchase.',
        source: 'IRDAI Underwriting and Proposal Disclosure Principles',
    },
];
