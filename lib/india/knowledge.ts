// Reviewed by: [pending legal professional review]

export type IndiaDocType =
  'leave_and_license' | 'employment_offer' | 'loan_agreement' | 'general_agreement';

export type ConfidenceLevel = 'general' | 'state-specific-verify';

export interface LegalKnowledgeItem {
  docType: IndiaDocType;
  topic: string;
  whatToCheck: string;
  whyItMatters: string;
  actOrSource: string;
  confidence: ConfidenceLevel;
}

export const INDIA_LEGAL_KNOWLEDGE: LegalKnowledgeItem[] = [
  // --- RENTAL / LEAVE & LICENSE ---
  {
    docType: 'leave_and_license',
    topic: 'Term and Registration',
    whatToCheck:
      'Agreements over 11 months generally require registration under the Registration Act 1908, which is why 11-month terms are customary in India. Check whether the agreement is registered or notarized.',
    whyItMatters:
      'Unregistered agreements for terms exceeding 11 months may face procedural and evidentiary hurdles in court if a dispute arises.',
    actOrSource: 'Registration Act 1908',
    confidence: 'general',
  },
  {
    docType: 'leave_and_license',
    topic: 'Stamp Duty and E-stamping',
    whatToCheck:
      'Check for a mention of stamp paper denomination, e-stamp certificate number, or franking details.',
    whyItMatters:
      'Stamp duty rates and rules vary across Indian states. Under the Indian Stamp Act 1899 and state stamp acts, insufficiently stamped agreements cannot be easily admitted as primary evidence in court until duty and penalties are paid.',
    actOrSource: 'Indian Stamp Act 1899 (and State Stamp Acts)',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'leave_and_license',
    topic: 'Governing Legal Framework',
    whatToCheck:
      'Check whether the contract is framed as a Leave and License under the Indian Easements Act 1882 or a Lease under the Transfer of Property Act 1882. Note that the Model Tenancy Act 2021 is a central advisory model act that applies only in states that have legislated on it.',
    whyItMatters:
      'A license confers permissive occupancy rights without tenancy estate, whereas a lease creates a property interest. Protections differ significantly.',
    actOrSource:
      'Indian Easements Act 1882 / Transfer of Property Act 1882 / Model Tenancy Act 2021',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'leave_and_license',
    topic: 'Security Deposit and Refund Timeline',
    whatToCheck:
      'Amount (months of rent), deduction terms, and the exact refund deadline upon handover of keys. Under the Model Tenancy Act 2021, the model norm is up to 2 months rent for residential premises.',
    whyItMatters:
      'Missing refund deadlines or broad deduction clauses frequently cause deposit forfeiture and dispute delays.',
    actOrSource: 'Model Tenancy Act 2021 (model benchmark)',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'leave_and_license',
    topic: 'Rent Escalation',
    whatToCheck:
      'Percentage of hike, frequency (e.g. annually), and advance notice requirement. Common market norm is 5% to 10% annually.',
    whyItMatters:
      'Compounding escalation without notice requirements can cause unexpected rent inflation.',
    actOrSource: 'Common market convention',
    confidence: 'general',
  },
  {
    docType: 'leave_and_license',
    topic: 'Lock-in Period and Early Termination Penalty',
    whatToCheck:
      'Whether the lock-in period applies mutually to both licensee and licensor, and what financial penalty applies for early exit.',
    whyItMatters:
      'One-sided lock-in where the tenant forfeits deposit or owes remaining months without reciprocal landlord obligation is onerous.',
    actOrSource: 'Indian Contract Act 1872',
    confidence: 'general',
  },
  {
    docType: 'leave_and_license',
    topic: 'Notice Period and Eviction Grounds',
    whatToCheck:
      'Length of termination notice (typically 1 to 2 months) and whether notice periods are symmetric for both parties.',
    whyItMatters:
      'Shorter landlord notice (e.g. 7 or 15 days) leaves the licensee vulnerable to abrupt displacement.',
    actOrSource: 'State Rent Control & Easements Act principles',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'leave_and_license',
    topic: 'Landlord Inspection and Prior Notice',
    whatToCheck:
      'Whether the licensor must give prior reasonable notice (commonly 24 hours) before entering the premises.',
    whyItMatters:
      'Clauses granting unrestricted entry "at any time" infringe upon peaceful enjoyment and quiet possession.',
    actOrSource: 'Common residential tenancy principles',
    confidence: 'general',
  },
  {
    docType: 'leave_and_license',
    topic: 'Maintenance, Society Dues, and Utilities',
    whatToCheck:
      'Explicit demarcation of who pays internal maintenance vs housing society dues, property tax, and utilities.',
    whyItMatters:
      'Ambiguity causes sudden unexpected demands for major building repairs or arrears.',
    actOrSource: 'Common residential tenancy principles',
    confidence: 'general',
  },
  {
    docType: 'leave_and_license',
    topic: 'Auto-Renewal and Extension',
    whatToCheck:
      'Whether the agreement automatically renews or requires fresh mutual written consent and re-registration.',
    whyItMatters:
      'Auto-renewal clauses can trap the occupant into escalation terms without re-negotiation.',
    actOrSource: 'Indian Contract Act 1872',
    confidence: 'general',
  },
  {
    docType: 'leave_and_license',
    topic: 'Police Verification and Identity Compliance',
    whatToCheck:
      'Requirement for tenant police verification / intimation to the local police station.',
    whyItMatters:
      'Police intimation is mandatory in many metro jurisdictions (e.g., Pune, Mumbai, Delhi, Bengaluru) under local police commissioner directives.',
    actOrSource: 'Code of Criminal Procedure / Local Police Commissioner Orders',
    confidence: 'state-specific-verify',
  },

  // --- EMPLOYMENT OFFER ---
  {
    docType: 'employment_offer',
    topic: 'Notice Period and Buy-out Terms',
    whatToCheck:
      'Notice period length during probation and post-confirmation, and whether notice buy-out is bilateral or company-discretionary.',
    whyItMatters:
      'Excessive notice periods (e.g. 90 days) with no employee buy-out option can hinder career mobility.',
    actOrSource:
      'Industrial Employment (Standing Orders) Act / State Shops and Establishments Acts',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'employment_offer',
    topic: 'Employment Bonds and Training Cost Recovery',
    whatToCheck:
      'Clauses requiring service bonds (e.g. 1 to 2 years) or repayment of training expenses if leaving early.',
    whyItMatters:
      'Under Indian law (Indian Contract Act 1872), employers can generally recover only actual, reasonable expenses incurred for specialized training, not punitive damages or disproportionate penalties.',
    actOrSource: 'Indian Contract Act 1872 (Section 74 principle)',
    confidence: 'general',
  },
  {
    docType: 'employment_offer',
    topic: 'Post-Employment Non-Compete Restraints',
    whatToCheck:
      'Restrictions preventing the employee from working for competitors or in the same industry after employment ends.',
    whyItMatters:
      'Under Section 27 of the Indian Contract Act 1872, covenants in restraint of trade post-employment are generally viewed as void and unenforceable by Indian courts. However, non-solicitation and confidentiality protections may remain enforceable.',
    actOrSource: 'Indian Contract Act 1872 (Section 27 principle)',
    confidence: 'general',
  },
  {
    docType: 'employment_offer',
    topic: 'Liquidated Damages vs Penalty Clauses',
    whatToCheck:
      'Clauses imposing fixed monetary fines or forfeiture of earned salary for breach of employment terms.',
    whyItMatters:
      'Section 74 of the Indian Contract Act 1872 allows reasonable compensation for actual loss proved, but Indian courts typically do not enforce excessive punitive fines in employment contracts.',
    actOrSource: 'Indian Contract Act 1872 (Section 74 principle)',
    confidence: 'general',
  },
  {
    docType: 'employment_offer',
    topic: 'Variable Pay, Bonus Clawbacks, and ESOPs',
    whatToCheck:
      'Vesting schedules, forfeiture on resignation, and conditions under which bonuses can be reclaimed.',
    whyItMatters:
      'Vague discretionary clauses often lead to denial of accrued bonuses if resigning before payout date.',
    actOrSource: 'Payment of Bonus Act 1965 / Indian Contract Act 1872',
    confidence: 'general',
  },
  {
    docType: 'employment_offer',
    topic: 'Statutory Benefits and Labour Codes',
    whatToCheck: 'Provident Fund (EPF), Gratuity eligibility, and standard working hours.',
    whyItMatters:
      'Statutory benefits under the EPF Act 1952 and Payment of Gratuity Act 1972 are mandatory rights. Note that Indian labour laws are in transition under the newer Labour Codes.',
    actOrSource: 'Employees Provident Funds Act 1952 / Payment of Gratuity Act 1972',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'employment_offer',
    topic: 'Moonlighting and Intellectual Property Assignment',
    whatToCheck: 'Restrictions on dual employment, freelance work, and scope of IP assignment.',
    whyItMatters:
      'Broad assignments claiming IP developed outside office hours on personal equipment without company resources may be contested.',
    actOrSource: 'Copyright Act 1957 / Indian Contract Act 1872',
    confidence: 'general',
  },

  // --- LOAN AGREEMENT ---
  {
    docType: 'loan_agreement',
    topic: 'Interest Rate, APR, and Key Fact Statement (KFS)',
    whatToCheck:
      'Fixed vs floating interest rate, annualized percentage rate (APR), and whether a standardized Key Fact Statement (KFS) is provided.',
    whyItMatters:
      'RBI guidelines mandate that regulated entities provide retail borrowers with a standardized KFS detailing all-inclusive borrowing costs before loan execution.',
    actOrSource:
      'Reserve Bank of India (RBI) Regulatory Framework on Digital Lending & Fair Practices Code',
    confidence: 'general',
  },
  {
    docType: 'loan_agreement',
    topic: 'Processing Fees, Insurance Bundling, and Hidden Charges',
    whatToCheck:
      'Deductions upfront from loan disbursement, mandatory loan protection insurance, and administrative fees.',
    whyItMatters:
      'Upfront fee deductions reduce the actual net disbursement while interest accrues on the gross principal.',
    actOrSource: 'RBI Fair Practices Code',
    confidence: 'general',
  },
  {
    docType: 'loan_agreement',
    topic: 'Prepayment and Foreclosure Charges',
    whatToCheck: 'Penalties for early partial or full repayment of the loan balance.',
    whyItMatters:
      'The RBI has restricted foreclosure and prepayment penalties on floating rate term loans sanctioned to individual borrowers. Check current applicable RBI notifications for fixed vs floating loans.',
    actOrSource: 'Reserve Bank of India (RBI) Guidelines on Prepayment Penalties',
    confidence: 'state-specific-verify',
  },
  {
    docType: 'loan_agreement',
    topic: 'Penal Charges vs Penal Interest Compounding',
    whatToCheck:
      'How overdue payments are penalized. RBI norms mandate reasonable "penal charges" rather than compounding "penal interest" on overdue amounts.',
    whyItMatters: 'Compounding penal interest leads to debt spirals for delayed EMIs.',
    actOrSource: 'RBI Guidelines on Fair Lending Practice - Penal Charges in Loan Accounts',
    confidence: 'general',
  },
  {
    docType: 'loan_agreement',
    topic: 'Default, Acceleration, and Recovery Terms',
    whatToCheck:
      'Definition of event of default, cure period notice before acceleration, and third-party recovery agent conduct clauses.',
    whyItMatters:
      'Agreements lacking a cure period permit lenders to demand full immediate repayment on a single delayed installment.',
    actOrSource: 'RBI Fair Practices Code on Recovery Agents',
    confidence: 'general',
  },
  {
    docType: 'loan_agreement',
    topic: 'Guarantor and Co-Borrower Joint Liability',
    whatToCheck:
      'Whether guarantors are equally liable on demand without first exhausting remedies against the primary borrower.',
    whyItMatters:
      'Joint and several liability clauses make family member guarantors immediately vulnerable to asset recovery.',
    actOrSource: 'Indian Contract Act 1872 (Section 128 principle of co-extensive liability)',
    confidence: 'general',
  },

  // --- ALL DOCUMENT TYPES ---
  {
    docType: 'general_agreement',
    topic: 'Arbitration and Unilateral Arbitrator Appointment',
    whatToCheck:
      'Dispute resolution clause specifying arbitration and mechanism for appointing the sole arbitrator.',
    whyItMatters:
      'Under Indian arbitration jurisprudence (e.g. Section 12(5) of the Arbitration and Conciliation Act 1996), unilateral appointment of a sole arbitrator by one interested party is legally contested. Independent or mutual appointment is advisable.',
    actOrSource: 'Arbitration and Conciliation Act 1996',
    confidence: 'general',
  },
  {
    docType: 'general_agreement',
    topic: 'Jurisdiction and Seat of Courts',
    whatToCheck: 'Exclusive territorial jurisdiction specified for court proceedings.',
    whyItMatters:
      'A distant court seat (e.g. in another state) increases the cost and difficulty of seeking legal remedy or defense.',
    actOrSource: 'Code of Civil Procedure 1908',
    confidence: 'general',
  },
  {
    docType: 'general_agreement',
    topic: 'Data Privacy and Consent',
    whatToCheck:
      'Broad consent clauses granting permission to share financial, biometric, or personal data with unspecified affiliates or third parties.',
    whyItMatters:
      'The Digital Personal Data Protection Act 2023 requires clear, specific, informed, and unconditional consent for processing personal data.',
    actOrSource: 'Digital Personal Data Protection Act 2023',
    confidence: 'general',
  },
  {
    docType: 'general_agreement',
    topic: 'Unilateral Modification and One-Sided Rights',
    whatToCheck:
      'Clauses allowing one party to unilaterally modify terms, rent, interest, or scope without written consent.',
    whyItMatters:
      'Unilateral modification powers undermine contractual reciprocity and predictability.',
    actOrSource: 'Indian Contract Act 1872 / Consumer Protection Act 2019',
    confidence: 'general',
  },
  {
    docType: 'general_agreement',
    topic: 'Unfair Contract Terms in Consumer Contracts',
    whatToCheck:
      'Exclusions of liability, excessive penalties, or arbitrary termination rights in standard-form contracts.',
    whyItMatters:
      'The Consumer Protection Act 2019 defines and addresses unfair contract terms in consumer transactions. Always verify with a legal practitioner.',
    actOrSource: 'Consumer Protection Act 2019',
    confidence: 'general',
  },
];

export function getKnowledgeForDocType(docType: IndiaDocType): LegalKnowledgeItem[] {
  return INDIA_LEGAL_KNOWLEDGE.filter(
    (item) => item.docType === docType || item.docType === 'general_agreement'
  );
}

export function formatKnowledgeForPrompt(docType: IndiaDocType, stateName: string): string {
  const items = getKnowledgeForDocType(docType);
  return items
    .map((item, idx) => {
      const checkState =
        item.confidence === 'state-specific-verify'
          ? `[NOTE: This varies by state; check the ${stateName} rules. Never state as settled law.]`
          : `[General benchmark norm]`;
      return `${idx + 1}. TOPIC: ${item.topic}
- What to check: ${item.whatToCheck}
- Why it matters: ${item.whyItMatters}
- Permitted Act or Source: ${item.actOrSource}
- Confidence benchmark: ${checkState}`;
    })
    .join('\n\n');
}

export const LEGAL_AID_HELPLINES = {
  nalsa: {
    name: 'NALSA & State/District Legal Services Authorities (DLSA)',
    phone: '15100',
    description:
      'Free legal aid and advice for citizens across all Indian districts under the Legal Services Authorities Act 1987.',
  },
  consumerHelpline: {
    name: 'National Consumer Helpline (NCH)',
    phone: '1915',
    whatsapp: '8800001915',
    description:
      'Government of India consumer assistance for unfair contract terms, deficiency in service, and financial grievances.',
  },
  teleLaw: {
    name: 'Tele-Law (Department of Justice)',
    url: 'https://tele-law.in',
    description:
      'Digital platform connecting citizens with panel advocates for legal advice through Common Service Centres (CSCs).',
  },
};
