'use client';

import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  AlertCircle,
  FileText,
  Building,
  RotateCcw,
  Languages,
  Send,
  HelpCircle,
} from 'lucide-react';
import { LetterTemplateTypeEnum, DraftLetterResponse, AnalyzeResult } from '@/lib/schemas';
import { SUPPORTED_LANGUAGES } from '@/lib/india/constants';

interface DraftLetterTabProps {
  analysis?: AnalyzeResult | null;
  initialPreset?: {
    templateType:
      | 'deposit_refund'
      | 'clause_negotiation'
      | 'tenancy_termination_or_resignation'
      | 'consumer_complaint';
    issue?: string;
    amount?: string;
  } | null;
  id?: string;
}

type TemplateType =
  | 'deposit_refund'
  | 'clause_negotiation'
  | 'tenancy_termination_or_resignation'
  | 'consumer_complaint';

const TEMPLATES: Array<{
  id: TemplateType;
  title: string;
  subtitle: string;
  icon: string;
  defaultSubject: string;
}> = [
  {
    id: 'deposit_refund',
    title: 'Request to return security deposit',
    subtitle:
      'Demand refund of deposit post keys handover with bank details and deduction breakdown',
    icon: '💰',
    defaultSubject: 'Request for Full Refund of Security Deposit for Premises',
  },
  {
    id: 'clause_negotiation',
    title: 'Request clarification or negotiate a clause',
    subtitle:
      'Politely propose revisions to lock-in, escalation, notice periods, or arbitrary fee clauses',
    icon: '🤝',
    defaultSubject: 'Request for Mutual Clarification and Revision of Clause in Draft Agreement',
  },
  {
    id: 'tenancy_termination_or_resignation',
    title: 'Polite notice to end tenancy or resign',
    subtitle:
      'Serve agreed notice period, specify handover/last working date, and request clearance',
    icon: '✉️',
    defaultSubject: 'Notice of Termination / Vacating Premises in Accordance with Agreement Terms',
  },
  {
    id: 'consumer_complaint',
    title: 'Consumer complaint to a company',
    subtitle:
      'Report defective product, deficient service, or billing error and request prompt resolution',
    icon: '📦',
    defaultSubject:
      'Formal Complaint and Request for Immediate Resolution - Order / Service Reference',
  },
];

export function DraftLetterTab({
  analysis,
  initialPreset,
  id = 'draft-letter-tab-view',
}: DraftLetterTabProps) {
  const [templateType, setTemplateType] = useState<TemplateType>(
    () => initialPreset?.templateType || 'deposit_refund'
  );

  // Form Fields
  const [senderName, setSenderName] = useState<string>(() => {
    const userName = analysis?.plainSummary?.parties?.userName;
    return userName && userName !== 'Not explicitly named' ? userName : '';
  });
  const [recipientName, setRecipientName] = useState<string>(() => {
    const cName = analysis?.plainSummary?.parties?.counterpartyName;
    return cName && cName !== 'Not explicitly named' ? cName : '';
  });
  const [recipientRoleOrDesignation, setRecipientRoleOrDesignation] = useState<string>(() => {
    return analysis?.plainSummary?.parties?.counterpartyRole || '';
  });
  const [addressOrPremises, setAddressOrPremises] = useState<string>('');
  const [keyReferenceNumber, setKeyReferenceNumber] = useState<string>(() => {
    return analysis?.plainSummary?.termDuration
      ? `Agreement Term: ${analysis.plainSummary.termDuration}`
      : '';
  });
  const [amountInvolved, setAmountInvolved] = useState<string>(() => {
    if (initialPreset?.amount) return initialPreset.amount;
    if (analysis?.rentalMathExtracted?.formattedDeposit) {
      return analysis.rentalMathExtracted.formattedDeposit;
    }
    if (analysis?.rentalMathExtracted?.securityDeposit) {
      return `₹${analysis.rentalMathExtracted.securityDeposit.toLocaleString('en-IN')}`;
    }
    return '';
  });
  const [specificClauseOrIssue, setSpecificClauseOrIssue] = useState<string>(() => {
    return initialPreset?.issue || '';
  });
  const [proposedResolutionOrDeadline, setProposedResolutionOrDeadline] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');

  // Draft Result State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<DraftLetterResponse | null>(null);

  // Editable drafts
  const [activeLangTab, setActiveLangTab] = useState<'english' | 'local'>('english');
  const [editableEnglishBody, setEditableEnglishBody] = useState<string>('');
  const [editableLocalBody, setEditableLocalBody] = useState<string>('');
  const [editableEnglishSubject, setEditableEnglishSubject] = useState<string>('');
  const [editableLocalSubject, setEditableLocalSubject] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/draft-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType,
          senderName: senderName.trim(),
          recipientName: recipientName.trim(),
          recipientRoleOrDesignation: recipientRoleOrDesignation.trim(),
          addressOrPremises: addressOrPremises.trim(),
          keyReferenceNumber: keyReferenceNumber.trim(),
          amountInvolved: amountInvolved.trim(),
          specificClauseOrIssue: specificClauseOrIssue.trim(),
          proposedResolutionOrDeadline: proposedResolutionOrDeadline.trim(),
          additionalNotes: additionalNotes.trim(),
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate draft.');
      }

      setDraftResult(data);
      setEditableEnglishSubject(data.subjectEnglish);
      setEditableEnglishBody(data.bodyEnglish);
      setEditableLocalSubject(data.subjectLocal);
      setEditableLocalBody(data.bodyLocal);
      setActiveLangTab('english');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while drafting the letter.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const isEn = activeLangTab === 'english';
    const sub = isEn ? editableEnglishSubject : editableLocalSubject;
    const bod = isEn ? editableEnglishBody : editableLocalBody;
    const fullText = `Subject: ${sub}\n\n${bod}\n\n---\nDraft for your reference. Have it reviewed before sending anything formal.`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const isEn = activeLangTab === 'english';
    const sub = isEn ? editableEnglishSubject : editableLocalSubject;
    const bod = isEn ? editableEnglishBody : editableLocalBody;
    const text = `*Subject:* ${sub}\n\n${bod}\n\n_(Draft for reference)_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const isEn = activeLangTab === 'english';
    const sub = isEn ? editableEnglishSubject : editableLocalSubject;
    const bod = isEn ? editableEnglishBody : editableLocalBody;
    const fullText = `Subject: ${sub}\n\n${bod}\n\n---\nDraft for your reference. Have it reviewed before sending anything formal.`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `draft_letter_${templateType}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id={id} className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Reassurance / Scope Header */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-text">
                Draft a Letter (Basic Legal Assistance)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-muted text-text-muted font-semibold border border-border">
                Communication Templates
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              Create a polite, factual letter to your landlord, employer, or seller. Review the
              auto-filled fields, customize the details, and generate an editable draft in English
              and your local language.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-risk-high-bg border border-risk-high/40 text-risk-high text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Template Selector */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
          1. Select Letter Purpose
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((tmpl) => {
            const isSelected = templateType === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  setTemplateType(tmpl.id);
                  if (draftResult) setDraftResult(null);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-surface hover:bg-surface-muted/50'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{tmpl.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-text">{tmpl.title}</div>
                  <div className="text-xs text-text-muted line-clamp-2 mt-0.5">{tmpl.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields to Review and Edit */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              2. Review & Fill Details
            </span>
            <h3 className="text-sm sm:text-base font-bold text-text mt-0.5">
              {analysis
                ? 'Auto-filled from your document where detected'
                : 'Fill in the basic particulars'}
            </h3>
          </div>
          {analysis && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-risk-low-bg text-risk-low border border-risk-low/30 font-medium">
              Document data attached
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Your Name (Sender):
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Recipient Name / Company:
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Rajesh Gupta / ABC Properties Ltd."
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Recipient Role / Designation:
            </label>
            <input
              type="text"
              value={recipientRoleOrDesignation}
              onChange={(e) => setRecipientRoleOrDesignation(e.target.value)}
              placeholder="e.g. Landlord / HR Manager / Customer Support"
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Premises / Property / Order Reference:
            </label>
            <input
              type="text"
              value={addressOrPremises}
              onChange={(e) => setAddressOrPremises(e.target.value)}
              placeholder="e.g. Flat 402, Sunshine Apts, Baner, Pune"
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Reference ID / Agreement Date:
            </label>
            <input
              type="text"
              value={keyReferenceNumber}
              onChange={(e) => setKeyReferenceNumber(e.target.value)}
              placeholder="e.g. Agreement dated 01/10/2023 or Order #8921"
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Amount Involved (₹):
            </label>
            <input
              type="text"
              value={amountInvolved}
              onChange={(e) => setAmountInvolved(e.target.value)}
              placeholder="e.g. ₹60,000"
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-muted block mb-1">
            Specific Clause, Grievance, or Issue to Address:
          </label>
          <textarea
            rows={2}
            value={specificClauseOrIssue}
            onChange={(e) => setSpecificClauseOrIssue(e.target.value)}
            placeholder="e.g. Keys handed over on 31st August after 1-month notice; deduction of ₹30,000 for repainting is unwarranted without itemized invoice."
            className="w-full rounded-lg border border-border bg-surface-muted/20 p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Requested Resolution & Timeline:
            </label>
            <input
              type="text"
              value={proposedResolutionOrDeadline}
              onChange={(e) => setProposedResolutionOrDeadline(e.target.value)}
              placeholder="e.g. Direct bank transfer within 7 working days"
              className="w-full h-10 rounded-lg border border-border bg-surface-muted/20 px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Draft Language:
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

        <div className="flex justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Generating Bilingual Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Editable Draft Letter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DRAFT RESULT VIEW */}
      {draftResult && (
        <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-5 shadow-xs animate-in fade-in duration-150">
          {/* MANDATORY DISCLAIMER BANNER */}
          <div className="rounded-xl border border-border bg-surface-muted/60 p-3.5 sm:p-4 text-xs sm:text-sm text-text-muted flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-text block">{draftResult.disclaimerBanner}</span>
              <span className="text-xs text-text-muted mt-0.5 block">
                This is communication assistance, not formal legal representation, an
                advocate&apos;s legal notice, or court filing.
              </span>
            </div>
          </div>

          {/* Language Switcher Tabs & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLangTab('english')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  activeLangTab === 'english'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface-muted text-text-muted hover:text-text'
                }`}
              >
                English Version
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('local')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  activeLangTab === 'local'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface-muted text-text-muted hover:text-text'
                }`}
              >
                {draftResult.targetLanguageName} Version
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text cursor-pointer transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-risk-low" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text cursor-pointer transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Editable Subject & Body */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">
                Subject Line (Editable):
              </label>
              <input
                type="text"
                value={activeLangTab === 'english' ? editableEnglishSubject : editableLocalSubject}
                onChange={(e) => {
                  if (activeLangTab === 'english') {
                    setEditableEnglishSubject(e.target.value);
                  } else {
                    setEditableLocalSubject(e.target.value);
                  }
                }}
                className="w-full h-10 font-medium text-sm rounded-lg border border-border bg-surface px-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">
                Letter Body (Editable text - tweak as needed):
              </label>
              <textarea
                rows={14}
                value={activeLangTab === 'english' ? editableEnglishBody : editableLocalBody}
                onChange={(e) => {
                  if (activeLangTab === 'english') {
                    setEditableEnglishBody(e.target.value);
                  } else {
                    setEditableLocalBody(e.target.value);
                  }
                }}
                className="w-full font-sans text-sm rounded-xl border border-border bg-surface-muted/20 p-4 text-text leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Sending Tips and Instructions */}
          {draftResult.instructionsForUser && draftResult.instructionsForUser.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-muted/30 border border-border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                Practical Tips Before Sending:
              </span>
              <ul className="space-y-1">
                {draftResult.instructionsForUser.map((inst, i) => (
                  <li key={i} className="text-xs text-text-muted flex items-start gap-2">
                    <span className="text-primary font-bold">&bull;</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
