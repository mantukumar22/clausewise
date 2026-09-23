'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  PhoneCall,
  MessageSquareShare,
  AlertOctagon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AnalyzeResult } from '@/lib/schemas';
import { QuoteBlock } from '@/components/ui/QuoteBlock';

interface LawyerBriefTabProps {
  analysis: AnalyzeResult;
  fileName: string;
  selectedState: string;
  onOpenWhatsAppModal: () => void;
}

export function LawyerBriefTab({
  analysis,
  fileName,
  selectedState,
  onOpenWhatsAppModal,
}: LawyerBriefTabProps) {
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);

  const { lawyerBrief, plainSummary, clauses, missingProtections } = analysis;

  const highRiskClauses = clauses.filter((c) => c.risk === 'high');

  const generateMarkdownBrief = () => {
    const lines = [
      `# CLAUSEWISE LEGAL CONSULTATION BRIEF`,
      `Document: ${fileName}`,
      `Jurisdiction: ${selectedState}, India`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `Note: Legal information, not legal advice.\n`,
      `## 1. WHAT I AM AGREEING TO (SUMMARY)`,
      plainSummary.whatAmIAgreeingTo,
      `\n- Term: ${plainSummary.termDuration}`,
      `- Financials: ${plainSummary.moneyObligations}`,
      `- Termination / Notice: ${plainSummary.terminationConditions}\n`,
      `## 2. CRITICAL CLAUSES REQUIRING REVIEW`,
      ...highRiskClauses.map(
        (c) =>
          `### ${c.title} (Page ${c.pageNumber})\n- Quote: "${c.verbatimQuote}"\n- Plain explanation: ${c.plainExplanation}\n- Why it matters: ${c.whyItMatters}\n`
      ),
      `## 3. MISSING EXPECTED PROTECTIONS`,
      ...missingProtections.map(
        (m) =>
          `- Missing: ${m.topic}\n  Risk: ${m.practicalRisk}\n  Recommended: ${m.recommendation}`
      ),
      `\n## 4. QUESTIONS FOR LAWYER OR COUNTERPARTY`,
      ...lawyerBrief.prioritizedQuestions.map((q, idx) => `${idx + 1}. ${q}`),
      `\n## 5. NEGOTIATION TALKING POINTS`,
      ...lawyerBrief.negotiationPoints.map((np, idx) => `${idx + 1}. ${np}`),
      `\n## 6. FREE HELPLINES (INDIA)`,
      `- NALSA Free Legal Aid: 15100`,
      `- National Consumer Helpline: 1915`,
    ];
    return lines.join('\n');
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(generateMarkdownBrief());
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="lawyer-brief-tab-content" className="space-y-6 pb-12 print:p-0">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <h3 className="text-base font-bold text-text">
              Lawyer Consultation & Negotiation Brief
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            A concise, printable briefing sheet with prioritized questions for legal counsel or
            landlord/employer discussion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-risk-low-bg text-risk-low-fg border border-risk-low-border hover:opacity-90 transition cursor-pointer min-h-[40px]"
          >
            <MessageSquareShare className="w-4 h-4" />
            <span>WhatsApp Summary</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBrief}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-muted hover:bg-border text-text border border-border transition cursor-pointer min-h-[40px]"
          >
            {copiedBrief ? (
              <Check className="w-4 h-4 text-risk-low-fg" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copiedBrief ? 'Copied' : 'Copy Brief'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer min-h-[40px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* The Printable Brief Sheet */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Header Metadata */}
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              ClauseWise Briefing Sheet
            </span>
            <h2 className="text-xl font-bold text-text mt-0.5">
              {fileName || 'Agreement Analysis'}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Jurisdiction: <span className="font-semibold text-text">{selectedState}, India</span>{' '}
              &bull;{' '}
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-left sm:text-right text-[11px] text-text-muted italic">
            Legal Information • Not Legal Advice
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            1. What You Are Agreeing To
          </h4>
          <p className="text-xs sm:text-sm text-text leading-relaxed bg-surface-muted/50 p-4 rounded-xl border border-border">
            {plainSummary.whatAmIAgreeingTo}
          </p>
        </div>

        {/* Prioritized Questions to Ask */}
        {lawyerBrief.prioritizedQuestions && lawyerBrief.prioritizedQuestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              2. Questions to Ask Your Lawyer or Counterparty
            </h4>
            <div className="space-y-2">
              {lawyerBrief.prioritizedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-muted/40 border border-border text-xs sm:text-sm text-text"
                >
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Negotiation Points */}
        {lawyerBrief.negotiationPoints && lawyerBrief.negotiationPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              3. Practical Negotiation Talking Points
            </h4>
            <div className="space-y-2">
              {lawyerBrief.negotiationPoints.map((np, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-soft/30 border border-primary/20 text-xs sm:text-sm text-text"
                >
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{np}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High Risk Clauses */}
        {highRiskClauses.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-risk-high-fg flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>4. High-Risk Clauses to Scrutinize ({highRiskClauses.length})</span>
            </h4>
            <div className="space-y-3">
              {highRiskClauses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-risk-high-border bg-risk-high-bg/30 space-y-2 text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text">{c.title}</span>
                    <span className="text-[11px] text-text-muted">Page {c.pageNumber}</span>
                  </div>
                  <QuoteBlock quote={c.verbatimQuote} />
                  <p className="text-xs text-text-muted">
                    <strong className="text-text">Why it matters:</strong> {c.whyItMatters}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Where to Get Help in India Panel (With direct tel: links) */}
      <div
        id="where-to-get-help-panel"
        className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4 print:hidden"
      >
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-primary shrink-0" />
          <div>
            <h3 className="text-base font-bold text-text">
              Where to Get Official Legal Help in India
            </h3>
            <p className="text-xs text-text-muted">
              Government-backed free legal aid and consumer helplines. Tap any number to call
              directly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* NALSA */}
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-border flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                Free Legal Aid
              </span>
              <h5 className="font-bold text-text text-sm">NALSA & DLSA</h5>
              <p className="text-text-muted text-xs mt-1 leading-relaxed">
                National and District Legal Services Authority. Free legal aid for eligible
                citizens, women, workers, and underprivileged individuals.
              </p>
            </div>
            <a
              href="tel:15100"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition min-h-[44px]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Toll-Free 15100</span>
            </a>
          </div>

          {/* National Consumer Helpline */}
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-border flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-risk-low-fg block mb-1">
                Consumer Protection
              </span>
              <h5 className="font-bold text-text text-sm">National Consumer Helpline (NCH)</h5>
              <p className="text-text-muted text-xs mt-1 leading-relaxed">
                Ministry of Consumer Affairs. Complaints regarding deposit withholding, unfair
                service agreements, and hidden charges.
              </p>
            </div>
            <a
              href="tel:1915"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-risk-low-bg text-risk-low-fg border border-risk-low-border hover:opacity-90 transition min-h-[44px]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Toll-Free 1915</span>
            </a>
          </div>

          {/* Tele-Law */}
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-border flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-risk-med-fg block mb-1">
                Video Consultation
              </span>
              <h5 className="font-bold text-text text-sm">Tele-Law (Govt of India)</h5>
              <p className="text-text-muted text-xs mt-1 leading-relaxed">
                Connect directly with panel advocates at nominal or zero fees via Common Service
                Centres or mobile portal.
              </p>
            </div>
            <a
              href="https://tele-law.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-semibold bg-surface border border-border text-text hover:bg-surface-muted transition min-h-[44px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit tele-law.in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
