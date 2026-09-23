'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  AlertOctagon,
  Shield,
  Phone,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
  Sparkles,
  Building2,
  FolderLock,
  MessageSquare,
  RotateCcw,
  PenTool,
} from 'lucide-react';
import { GuideMeResult, GuideMeOption } from '@/lib/schemas';
import { INDIAN_STATES, SUPPORTED_LANGUAGES } from '@/lib/india/constants';
import { LEGAL_AID_HELPLINES } from '@/lib/india/knowledge';

interface GuideMeTabProps {
  onGoToDraftLetter?: (preset: {
    templateType:
      | 'deposit_refund'
      | 'clause_negotiation'
      | 'tenancy_termination_or_resignation'
      | 'consumer_complaint';
    issue: string;
    amount?: string;
  }) => void;
  id?: string;
}

type SituationType =
  'deposit_refund' | 'unfair_termination' | 'loan_harassment' | 'consumer_complaint' | 'other';

const SITUATIONS: Array<{
  id: SituationType;
  title: string;
  subtitle: string;
  icon: string;
  defaultQuestions: Array<{ id: string; question: string; placeholder: string }>;
}> = [
  {
    id: 'deposit_refund',
    title: 'Landlord not returning security deposit',
    subtitle: 'Arbitrary deductions, delayed refund, or landlord unreachable after vacating',
    icon: '🏠',
    defaultQuestions: [
      {
        id: 'vacated',
        question: 'Have you already handed over the keys and premises?',
        placeholder: 'e.g. Yes, vacated on 1st of this month with keys returned.',
      },
      {
        id: 'records',
        question: 'Do you have bank transaction proof, rent receipts, or handover photos?',
        placeholder: 'e.g. Bank transfer slips and inspection photos taken on move-out day.',
      },
      {
        id: 'deductionReason',
        question: 'What reason did the landlord give for withholding the deposit?',
        placeholder: 'e.g. Claiming painting and general wear-and-tear charges.',
      },
      {
        id: 'amount',
        question: 'What is the approximate deposit amount pending (₹)?',
        placeholder: 'e.g. ₹60,000',
      },
    ],
  },
  {
    id: 'unfair_termination',
    title: 'Unfair job termination or salary withheld',
    subtitle:
      'Sudden termination, withheld final settlement, notice buyout dispute, or denied experience letter',
    icon: '💼',
    defaultQuestions: [
      {
        id: 'writtenNotice',
        question: 'Did you receive written termination notice or an email from HR?',
        placeholder: 'e.g. Received an email stating termination with immediate effect.',
      },
      {
        id: 'duesPending',
        question: 'What salary, gratuity, or reimbursements remain unpaid?',
        placeholder: 'e.g. Last 2 months salary plus accrued leave encashment.',
      },
      {
        id: 'employmentStatus',
        question: 'Were you a confirmed employee or on probation? Any bond signed?',
        placeholder: 'e.g. Confirmed employee with 2 years service, no training bond.',
      },
      {
        id: 'serviceLetter',
        question: 'Is the employer refusing to release your relieving and experience certificate?',
        placeholder: 'e.g. Yes, they refuse until arbitrary liquidated damages are paid.',
      },
    ],
  },
  {
    id: 'loan_harassment',
    title: 'Loan recovery agent harassment or excessive charges',
    subtitle:
      'Threatening calls, contacting family/friends, unauthorized visits, or compounding penal interest',
    icon: '💳',
    defaultQuestions: [
      {
        id: 'lenderType',
        question: 'Is the loan from a bank, registered NBFC, or an online instant loan app?',
        placeholder: 'e.g. Registered NBFC personal loan app.',
      },
      {
        id: 'harassmentType',
        question:
          'What harassment behavior has occurred (threats, calls outside 8am-7pm, contacting contacts)?',
        placeholder: 'e.g. Calls to parents at night and abusive WhatsApp messages.',
      },
      {
        id: 'noticeReceived',
        question: 'Have they served any formal legal demand notice in writing?',
        placeholder: 'e.g. Only WhatsApp notices, no formal registered post notice.',
      },
      {
        id: 'amountOverdue',
        question: 'How many EMIs are delayed and what penal charges are demanded?',
        placeholder: 'e.g. 1 EMI delayed, asking for 30% excessive penal charges.',
      },
    ],
  },
  {
    id: 'consumer_complaint',
    title: 'Defective product, cancelled service, or refund denial',
    subtitle:
      'Faulty electronics/appliances, flight/hotel cancellations, or service deficiencies without refund',
    icon: '📦',
    defaultQuestions: [
      {
        id: 'ticketRaised',
        question:
          'Have you raised a formal complaint or email ticket with company customer support?',
        placeholder: 'e.g. Yes, ticket #12345 raised 15 days ago with no response.',
      },
      {
        id: 'purchaseProof',
        question: 'Do you have invoice, warranty card, payment transaction receipt, or order ID?',
        placeholder: 'e.g. Yes, tax invoice and digital payment receipt from online portal.',
      },
      {
        id: 'companyReply',
        question: 'What response or excuse did the company provide?',
        placeholder: 'e.g. They claimed return window expired or physical damage.',
      },
      {
        id: 'costClaim',
        question: 'What is the value involved and what remedy do you seek (refund, replacement)?',
        placeholder: 'e.g. ₹28,000, seeking full refund.',
      },
    ],
  },
  {
    id: 'other',
    title: 'Other dispute, agreement, or civil grievance',
    subtitle:
      'Property neighbor issues, builder delay, freelancing payment, or general contract issue',
    icon: '⚖️',
    defaultQuestions: [
      {
        id: 'otherParty',
        question: 'Who is the counterparty involved (company, individual, builder, contractor)?',
        placeholder: 'e.g. Independent interior contractor.',
      },
      {
        id: 'writtenProof',
        question: 'Do you have any written agreement, emails, quotes, or chat messages?',
        placeholder: 'e.g. WhatsApp agreement and bank UPI payment receipts.',
      },
      {
        id: 'currentStatus',
        question:
          'What is the current status of the dispute and what have you communicated so far?',
        placeholder: 'e.g. Contractor stopped work midway and demands extra money.',
      },
      {
        id: 'outcomeWanted',
        question: 'What practical resolution are you hoping to achieve?',
        placeholder: 'e.g. Completion of remaining work or refund of unspent advance.',
      },
    ],
  },
];

export function GuideMeTab({ onGoToDraftLetter, id = 'guide-me-tab-view' }: GuideMeTabProps) {
  const [selectedSituation, setSelectedSituation] = useState<SituationType>('deposit_refund');
  const [userDescription, setUserDescription] = useState<string>('');
  const [jurisdictionState, setJurisdictionState] = useState<string>('Maharashtra');
  const [language, setLanguage] = useState<string>('English');
  const [step, setStep] = useState<'describe' | 'followup' | 'results'>('describe');

  // Follow-up answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Loading and result state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [guideResult, setGuideResult] = useState<GuideMeResult | null>(null);

  const currentSituationConfig = SITUATIONS.find((s) => s.id === selectedSituation)!;

  const handleContinueToFollowUp = () => {
    if (!userDescription.trim() || userDescription.trim().length < 10) {
      setError('Please write at least 1-2 sentences describing what happened.');
      return;
    }
    setError(null);
    setStep('followup');
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmitGuide = async () => {
    setLoading(true);
    setError(null);

    // Map questions with answers for prompt
    const followUpMap: Record<string, string> = {};
    currentSituationConfig.defaultQuestions.forEach((q) => {
      if (answers[q.id]?.trim()) {
        followUpMap[q.question] = answers[q.id].trim();
      }
    });

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situationType: selectedSituation,
          userDescription: userDescription.trim(),
          followUpAnswers: followUpMap,
          jurisdictionState,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate guidance.');
      }

      setGuideResult(data);
      setStep('results');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('describe');
    setGuideResult(null);
    setError(null);
  };

  return (
    <div id={id} className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Reassurance / Scope Header */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-text">
                Guide Me: Practical Options & Next Steps
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                No Document Required
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              Facing an issue with a landlord, employer, lender, or seller? Tell us what happened in
              plain words. We provide neutral legal information, practical options, which official
              forums people commonly approach, and evidence to gather.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-risk-high-bg border border-risk-high/40 text-risk-high text-xs sm:text-sm flex items-center gap-2.5">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Describe Situation */}
      {step === 'describe' && (
        <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-6 shadow-xs">
          {/* Situation Picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              1. Choose your situation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SITUATIONS.map((sit) => {
                const isSelected = selectedSituation === sit.id;
                return (
                  <button
                    key={sit.id}
                    type="button"
                    onClick={() => setSelectedSituation(sit.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-surface hover:bg-surface-muted/50'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{sit.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-text">{sit.title}</div>
                      <div className="text-xs text-text-muted line-clamp-2 mt-0.5">
                        {sit.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User's Own Words Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                2. Describe what happened in your own words
              </label>
              <span className="text-xs text-text-muted">
                Write in English, Hindi, or any language
              </span>
            </div>
            <textarea
              rows={4}
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="e.g. My landlord is refusing to return my security deposit of ₹50,000 even though I vacated the flat on 31st August and gave 1 month notice. He claims painting charges of ₹35,000 without any receipts..."
              className="w-full rounded-xl border border-border bg-surface-muted/30 p-3.5 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* State and Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/60">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">
                Your State / Union Territory:
              </label>
              <select
                value={jurisdictionState}
                onChange={(e) => setJurisdictionState(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">
                Language for Guidance:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.nativeName ? `${l.name} (${l.nativeName})` : l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleContinueToFollowUp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition cursor-pointer shadow-xs"
            >
              <span>Next: 4 Short Follow-up Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Follow-up Questions */}
      {step === 'followup' && (
        <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Step 2 of 2
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-text mt-0.5">
                A few quick details to personalize your options
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setStep('describe')}
              className="text-xs text-text-muted hover:text-text cursor-pointer underline"
            >
              &larr; Back
            </button>
          </div>

          <div className="space-y-4">
            {currentSituationConfig.defaultQuestions.map((q, idx) => (
              <div key={q.id} className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{q.question}</span>
                </label>
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full rounded-lg border border-border bg-surface-muted/30 px-3.5 py-2 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setStep('describe')}
              className="text-xs text-text-muted hover:text-text cursor-pointer"
            >
              Edit Description
            </button>
            <button
              type="button"
              onClick={handleSubmitGuide}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span>Structuring Your Guidance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get My Options & Next Steps</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Results Display */}
      {step === 'results' && guideResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ask About Another Problem</span>
            </button>
            {onGoToDraftLetter && (
              <button
                type="button"
                onClick={() =>
                  onGoToDraftLetter({
                    templateType:
                      selectedSituation === 'deposit_refund'
                        ? 'deposit_refund'
                        : selectedSituation === 'unfair_termination'
                          ? 'tenancy_termination_or_resignation'
                          : selectedSituation === 'consumer_complaint'
                            ? 'consumer_complaint'
                            : 'clause_negotiation',
                    issue: guideResult.whatThisSeemsToBeAbout,
                    amount: answers['amount'] || '',
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer transition shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draft a Polite Letter for this &rarr;</span>
              </button>
            )}
          </div>

          {/* SAFETY / EMERGENCY BANNER (FIRST if urgent or safety risk) */}
          {guideResult.isUrgentOrSafetyRisk && guideResult.safetyAlert && (
            <div className="rounded-2xl border-2 border-risk-high bg-risk-high-bg p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-risk-high text-white flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-risk-high">
                    Urgent Safety & Immediate Assistance Notice
                  </h3>
                  <p className="text-xs sm:text-sm text-text font-medium mt-1 leading-relaxed">
                    {guideResult.safetyAlert.warningMessage}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {guideResult.safetyAlert.contacts.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface border border-risk-high/30 space-y-1 shadow-xs"
                  >
                    <div className="text-xs font-bold text-text">{c.name}</div>
                    <div className="text-base font-black text-risk-high flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      <span>{c.numberOrUrl}</span>
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight">{c.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* "What this seems to be about" Plain-language restatement */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              What This Seems to Be About
            </span>
            <p className="text-sm sm:text-base text-text leading-relaxed font-medium">
              {guideResult.whatThisSeemsToBeAbout}
            </p>
            <div className="pt-2 text-xs text-text-muted italic flex items-center gap-1.5">
              <span>Note: {guideResult.jurisdictionNote}</span>
            </div>
          </div>

          {/* Options (2 to 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                Your Potential Options (Tradeoffs & Timelines)
              </h3>
              <span className="text-xs text-text-muted">Described neutrally</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guideResult.options.map((opt, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-border/90 transition shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm sm:text-base text-text">
                        Option {i + 1}: {opt.title}
                      </h4>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                          opt.effortCostLevel === 'Low'
                            ? 'bg-risk-low-bg text-risk-low border-risk-low/30'
                            : opt.effortCostLevel === 'Medium'
                              ? 'bg-risk-med-bg text-risk-med border-risk-med/30'
                              : 'bg-risk-high-bg text-risk-high border-risk-high/30'
                        }`}
                      >
                        {opt.effortCostLevel} Effort
                      </span>
                    </div>

                    {opt.summary && (
                      <p className="text-xs text-text-muted leading-relaxed">{opt.summary}</p>
                    )}

                    {/* Pros and Cons */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <span className="text-[11px] font-bold text-risk-low uppercase tracking-wider block mb-1">
                          Pros
                        </span>
                        <ul className="space-y-1">
                          {opt.pros.map((p, pIdx) => (
                            <li
                              key={pIdx}
                              className="text-xs text-text flex items-start gap-1.5 leading-snug"
                            >
                              <span className="text-risk-low font-bold shrink-0">&bull;</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-risk-med uppercase tracking-wider block mb-1">
                          Cons / Considerations
                        </span>
                        <ul className="space-y-1">
                          {opt.cons.map((c, cIdx) => (
                            <li
                              key={cIdx}
                              className="text-xs text-text-muted flex items-start gap-1.5 leading-snug"
                            >
                              <span className="text-risk-med font-bold shrink-0">&bull;</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>Timeline: {opt.typicalTimeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Next Steps (Ordered) */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base sm:text-lg text-text">
              Suggested Next Steps in Order
            </h3>
            <div className="space-y-3">
              {guideResult.suggestedNextSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-surface-muted/40 border border-border/70"
                >
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {step.stepNumber}
                  </span>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-semibold text-sm text-text">{step.action}</div>
                    <p className="text-xs text-text-muted leading-relaxed">{step.explanation}</p>
                    {step.precaution && (
                      <div className="text-[11px] text-risk-med font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Precaution: {step.precaution}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Which Office or Forum People Commonly Approach */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                Offices & Forums People Commonly Approach
              </h3>
            </div>
            <p className="text-xs text-text-muted">
              These official forums and statutory grievance authorities are available under Indian
              law:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guideResult.officesAndForums.map((forum, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-surface-muted/20 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm text-text">{forum.name}</div>
                    <div className="text-[11px] text-primary font-medium">{forum.authority}</div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {forum.description}
                    </p>
                  </div>
                  {forum.helplineOrPortal && (
                    <div className="pt-2 border-t border-border/60 text-xs font-semibold text-text flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{forum.helplineOrPortal}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Evidence to Gather */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                Documents & Evidence to Gather
              </h3>
            </div>
            <p className="text-xs text-text-muted">
              Preserve these records before sending any formal communication or filing a complaint:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {guideResult.documentsAndEvidenceToGather.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-muted/40 border border-border flex items-start gap-2 text-xs sm:text-sm text-text font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-risk-low shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Questions to Ask a Lawyer */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                Questions to Ask a Lawyer (if you consult one)
              </h3>
            </div>
            <div className="space-y-2">
              {guideResult.questionsToAskALawyer.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-muted/30 border border-border/70 text-xs sm:text-sm text-text leading-relaxed"
                >
                  &ldquo;{q}&rdquo;
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
