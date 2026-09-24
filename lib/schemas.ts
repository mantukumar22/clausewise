import { z } from 'zod';

// --- ENUMS & LITERALS ---
export const DocTypeEnum = z.enum([
  'leave_and_license',
  'employment_offer',
  'loan_agreement',
  'general_agreement',
]);

export const RiskLevelEnum = z.enum(['low', 'medium', 'high']);

export const ClauseCategoryEnum = z.enum([
  'payment',
  'termination',
  'renewal',
  'liability',
  'penalties',
  'privacy',
  'dispute-resolution',
  'other',
]);

export const FormalityStatusEnum = z.enum(['found', 'not_found', 'unclear']);

export const FavorsEnum = z.enum(['user', 'counterparty', 'neutral']);

// --- ANALYZE SCHEMAS ---

export const FormalityItemSchema = z.object({
  status: FormalityStatusEnum,
  details: z.string().describe('What was detected or missing in the document'),
  practicalAdvice: z.string().describe('Neutral guidance, e.g. confirm with registrar or lawyer'),
});

export const FormalitiesCheckSchema = z.object({
  stampDutyOrEStamp: FormalityItemSchema,
  registration: FormalityItemSchema,
  witnesses: FormalityItemSchema,
  notarization: FormalityItemSchema,
  signaturesOfAllParties: FormalityItemSchema,
  panAadhaarReferences: FormalityItemSchema,
  datedExecution: FormalityItemSchema,
});

export const RentalMathExtractedSchema = z.object({
  monthlyRent: z.number().nullable().optional(),
  securityDeposit: z.number().nullable().optional(),
  escalationPercent: z.number().nullable().optional(),
  termMonths: z.number().nullable().optional(),
  formattedRent: z.string().nullable().optional(),
  formattedDeposit: z.string().nullable().optional(),
});

export const ClauseCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  verbatimQuote: z.string().describe('Exact verbatim quote from the text'),
  pageNumber: z.number().int().min(1).default(1),
  plainExplanation: z.string().describe('Plain language explanation at ~8th grade level'),
  risk: RiskLevelEnum,
  whyItMatters: z
    .string()
    .describe('One-sentence practical consequence for tenant/employee/borrower'),
  category: ClauseCategoryEnum,
  isVerified: z.boolean().optional().default(true),
  matchConfidence: z.number().optional().default(100),
});

export const MissingProtectionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  whyExpected: z.string(),
  practicalRisk: z.string(),
  recommendation: z.string(),
});

export const KeyDateDeadlineSchema = z.object({
  id: z
    .string()
    .optional()
    .default(() => 'kd-' + Math.random().toString(36).slice(2, 7)),
  event: z.string(),
  dateOrPeriod: z.string().optional().default(''),
  dateOrTimeline: z.string().optional().default(''),
  actionRequired: z.string().optional().default(''),
  consequenceIfMissed: z.string().optional().default(''),
  pageNumber: z.number().int().min(1).default(1),
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  phase: z.enum(['before_signing', 'during_term', 'at_termination']),
  item: z.string().optional().default(''),
  task: z.string().optional().default(''),
  details: z.string().optional().default(''),
  criticality: z.enum(['must_do', 'recommended', 'optional']),
});

export const QuestionToAskSchema = z.object({
  id: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  question: z.string(),
  askTo: z.enum(['lawyer', 'counterparty', 'both']).default('both'),
  contextAndTalkingPoint: z.string().optional().default(''),
});

export const LawyerBriefSchema = z.object({
  executiveSummary: z.string().optional().default(''),
  prioritizedQuestions: z.array(z.string()).default([]),
  negotiationPoints: z.array(z.string()).default([]),
});

export const PlainSummarySchema = z.object({
  whatAmIAgreeingTo: z.string().describe('Plain language summary under 150 words'),
  parties: z.object({
    userRole: z.string().default('First Party / User'),
    userName: z.string().optional().default('Not explicitly named'),
    counterpartyRole: z.string().default('Counterparty'),
    counterpartyName: z.string().optional().default('Not explicitly named'),
  }),
  termDuration: z.string().describe('E.g. 11 months from 01/10/2024 to 31/08/2025'),
  moneyObligations: z.string().describe('Rent, fees, deposits, interest, penalties in ₹ format'),
  terminationConditions: z
    .string()
    .describe('Notice period, exit lock-in, grounds for eviction or discharge'),
});

export const InconsistencySeverityEnum = z.enum(['low', 'medium', 'high']);

export const InconsistencyItemSchema = z.object({
  id: z.string().default(() => 'inc-' + Math.random().toString(36).slice(2, 7)),
  title: z.string(),
  description: z
    .string()
    .describe('Clear explanation of what does not match, contradicts, or was left blank'),
  type: z
    .enum([
      'clause_contradiction',
      'words_vs_figures_mismatch',
      'conflicting_obligations',
      'unfilled_placeholder',
      'party_or_date_mismatch',
    ])
    .default('clause_contradiction'),
  quoteA: z.string().describe('First conflicting quote or blank placeholder'),
  pageA: z.number().int().min(1).default(1),
  quoteB: z.string().optional().default('').describe('Second conflicting quote if applicable'),
  pageB: z.number().int().min(1).optional().default(1),
  severity: InconsistencySeverityEnum.default('high'),
  whatToAskToClarify: z
    .string()
    .describe('Exact plain-language question to ask the other party to clarify'),
});

// The main model response schema for Analyze
export const AnalyzeResultSchema = z.object({
  isLegalDocument: z
    .boolean()
    .describe(
      'True if this is a legal agreement, contract, deed, offer or notice. False if random receipt, homework, recipe, etc.'
    ),
  rejectionReason: z.string().optional().describe('Explanation if isLegalDocument is false'),
  plainSummary: PlainSummarySchema,
  formalitiesCheck: FormalitiesCheckSchema,
  rentalMathExtracted: RentalMathExtractedSchema.optional(),
  inconsistencies: z.array(InconsistencyItemSchema).optional().default([]),
  clauses: z.array(ClauseCardSchema).min(1).max(30),
  missingProtections: z.array(MissingProtectionSchema),
  keyDatesAndDeadlines: z.array(KeyDateDeadlineSchema).optional().default([]),
  keyDates: z.array(KeyDateDeadlineSchema).optional().default([]),
  actionChecklist: z.array(ChecklistItemSchema),
  questionsToAsk: z.array(QuestionToAskSchema).optional().default([]),
  lawyerBrief: LawyerBriefSchema.optional().default({
    executiveSummary: '',
    prioritizedQuestions: [],
    negotiationPoints: [],
  }),
  whatsappSummary: z.string().optional().default(''),
  verificationReport: z
    .object({
      totalCitations: z.number(),
      verifiedCount: z.number(),
      unverifiedCount: z.number(),
      isScanned: z.boolean().default(false),
    })
    .optional(),
});

export type RiskLevel = z.infer<typeof RiskLevelEnum>;
export type ClauseCategory = z.infer<typeof ClauseCategoryEnum>;
export type InconsistencyItem = z.infer<typeof InconsistencyItemSchema>;
export type AnalyzeResult = z.infer<typeof AnalyzeResultSchema>;
export type ClauseCard = z.infer<typeof ClauseCardSchema>;
export type MissingProtection = z.infer<typeof MissingProtectionSchema>;
export type FormalitiesCheck = z.infer<typeof FormalitiesCheckSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type QuestionToAsk = z.infer<typeof QuestionToAskSchema>;
export type KeyDateItem = z.infer<typeof KeyDateDeadlineSchema>;

// API request schema for Analyze
export const AnalyzeApiRequestSchema = z.object({
  documentText: z.string().min(20, 'Document text must be at least 20 characters'),
  pagesText: z.array(z.string()).optional(),
  documentType: DocTypeEnum.default('leave_and_license'),
  jurisdictionState: z.string().default('Maharashtra'),
  language: z.string().default('English'),
  isScanned: z.boolean().optional().default(false),
  fileName: z.string().optional().default('document.pdf'),
});

export type AnalyzeApiRequest = z.input<typeof AnalyzeApiRequestSchema>;
export type AnalyzeApiRequestParsed = z.output<typeof AnalyzeApiRequestSchema>;

// --- COMPARE SCHEMAS ---

export const AddedClauseSchema = z.object({
  title: z.string(),
  quoteDocB: z.string(),
  pageDocB: z.number().default(1),
  explanation: z.string(),
  favors: FavorsEnum,
  reason: z.string(),
});

export const RemovedClauseSchema = z.object({
  title: z.string(),
  quoteDocA: z.string(),
  pageDocA: z.number().default(1),
  explanation: z.string(),
  favors: FavorsEnum,
  reason: z.string(),
});

export const ChangedClauseSchema = z.object({
  title: z.string(),
  quoteDocA: z.string(),
  pageDocA: z.number().default(1),
  quoteDocB: z.string(),
  pageDocB: z.number().default(1),
  explanationOfChange: z.string(),
  favors: FavorsEnum,
  reason: z.string(),
});

export const CompareResultSchema = z.object({
  netImpactVerdict: z.enum(['favorable_to_user', 'favorable_to_counterparty', 'mixed_neutral']),
  netImpactSummary: z
    .string()
    .describe('High level verdict explaining whether Document B is better or worse for the user'),
  addedClauses: z.array(AddedClauseSchema),
  removedClauses: z.array(RemovedClauseSchema),
  changedClauses: z.array(ChangedClauseSchema),
});

export type CompareResult = z.infer<typeof CompareResultSchema>;

export const CompareApiRequestSchema = z.object({
  documentTextA: z.string().min(20),
  documentTextB: z.string().min(20),
  docAName: z.string().default('Document A (Original)'),
  docBName: z.string().default('Document B (Revised)'),
  documentType: DocTypeEnum.default('leave_and_license'),
  jurisdictionState: z.string().default('Maharashtra'),
  language: z.string().default('English'),
});

export type CompareApiRequest = z.infer<typeof CompareApiRequestSchema>;

// --- CHAT SCHEMAS ---

export const ChatCitationSchema = z.object({
  quote: z.string(),
  pageNumber: z.number().default(1),
  isVerified: z.boolean().default(true),
});

export const ChatResultSchema = z.object({
  answer: z
    .string()
    .describe('Clear, plain language answer strictly grounded in the document text'),
  citations: z.array(ChatCitationSchema),
  isFoundInDocument: z.boolean(),
  relatedTopics: z.array(z.string()).default([]),
});

export type ChatResult = z.infer<typeof ChatResultSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatApiRequestSchema = z.object({
  documentText: z.string().min(20),
  messages: z.array(ChatMessageSchema).min(1),
  documentType: DocTypeEnum.default('leave_and_license'),
  jurisdictionState: z.string().default('Maharashtra'),
  language: z.string().default('English'),
});

export type ChatApiRequest = z.infer<typeof ChatApiRequestSchema>;

// --- GUIDE ME SCHEMAS ---

export const GuideMeOptionSchema = z.object({
  title: z.string(),
  summary: z.string().optional().default(''),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  effortCostLevel: z.enum(['Low', 'Medium', 'High']).default('Low'),
  typicalTimeline: z
    .string()
    .describe(
      'Always described as varies, e.g. "Varies; commonly 2 to 6 weeks depending on counterparty response"'
    ),
});

export const GuideMeStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  action: z.string(),
  explanation: z.string(),
  precaution: z.string().optional(),
});

export const GuideMeForumSchema = z.object({
  name: z.string(),
  authority: z.string(),
  description: z.string(),
  helplineOrPortal: z.string().optional(),
  relevance: z.string(),
});

export const GuideMeResultSchema = z.object({
  situationTitle: z.string(),
  whatThisSeemsToBeAbout: z
    .string()
    .describe('Plain-language neutral restatement of the user problem'),
  isUrgentOrSafetyRisk: z.boolean().default(false),
  safetyAlert: z
    .object({
      isEmergency: z.boolean(),
      warningMessage: z.string(),
      contacts: z.array(
        z.object({
          name: z.string(),
          numberOrUrl: z.string(),
          details: z.string(),
        })
      ),
    })
    .optional(),
  options: z.array(GuideMeOptionSchema).min(2).max(4),
  suggestedNextSteps: z.array(GuideMeStepSchema).min(2),
  officesAndForums: z.array(GuideMeForumSchema),
  documentsAndEvidenceToGather: z.array(z.string()).min(2),
  questionsToAskALawyer: z.array(z.string()).min(2),
  jurisdictionNote: z
    .string()
    .default('Rules and procedural steps vary by state and individual facts.'),
});

export type GuideMeOption = z.infer<typeof GuideMeOptionSchema>;
export type GuideMeStep = z.infer<typeof GuideMeStepSchema>;
export type GuideMeForum = z.infer<typeof GuideMeForumSchema>;
export type GuideMeResult = z.infer<typeof GuideMeResultSchema>;

export const GuideMeApiRequestSchema = z.object({
  situationType: z.enum([
    'deposit_refund',
    'unfair_termination',
    'loan_harassment',
    'consumer_complaint',
    'other',
  ]),
  userDescription: z.string().min(10, 'Please describe your situation in at least a few words'),
  followUpAnswers: z.record(z.string(), z.string()).optional().default({}),
  jurisdictionState: z.string().default('Maharashtra'),
  language: z.string().default('English'),
});

export type GuideMeApiRequest = z.infer<typeof GuideMeApiRequestSchema>;

// --- DRAFT A LETTER SCHEMAS ---

export const LetterTemplateTypeEnum = z.enum([
  'deposit_refund',
  'clause_negotiation',
  'tenancy_termination_or_resignation',
  'consumer_complaint',
]);

export const DraftLetterRequestSchema = z.object({
  templateType: LetterTemplateTypeEnum,
  senderName: z.string().default(''),
  recipientName: z.string().default(''),
  recipientRoleOrDesignation: z.string().optional().default(''),
  addressOrPremises: z.string().optional().default(''),
  keyReferenceNumber: z.string().optional().default(''), // Agreement date, Order ID, Employee ID
  amountInvolved: z.string().optional().default(''),
  specificClauseOrIssue: z.string().optional().default(''),
  proposedResolutionOrDeadline: z.string().optional().default(''),
  additionalNotes: z.string().optional().default(''),
  language: z.string().default('English'),
});

export const DraftLetterResponseSchema = z.object({
  templateType: LetterTemplateTypeEnum,
  title: z.string(),
  disclaimerBanner: z
    .string()
    .default('Draft for your reference. Have it reviewed before sending anything formal.'),
  subjectEnglish: z.string(),
  bodyEnglish: z.string(),
  subjectLocal: z.string(),
  bodyLocal: z.string(),
  targetLanguageName: z.string(),
  instructionsForUser: z.array(z.string()).default([]),
});

export type DraftLetterRequest = z.infer<typeof DraftLetterRequestSchema>;
export type DraftLetterResponse = z.infer<typeof DraftLetterResponseSchema>;
