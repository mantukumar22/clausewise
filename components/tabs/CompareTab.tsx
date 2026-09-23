'use client';

import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Scale,
  Sparkles,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { CompareResult } from '@/lib/schemas';
import { IndiaDocType } from '@/lib/india/knowledge';
import { QuoteBlock } from '@/components/ui/QuoteBlock';

interface CompareTabProps {
  currentDocumentText: string;
  currentDocumentName: string;
  selectedDocType: IndiaDocType;
  selectedState: string;
  selectedLanguage: string;
}

export function CompareTab({
  currentDocumentText,
  currentDocumentName,
  selectedDocType,
  selectedState,
  selectedLanguage,
}: CompareTabProps) {
  const [docAText, setDocAText] = useState<string>(currentDocumentText || '');
  const [docAName, setDocAName] = useState<string>(currentDocumentName || 'Document A (Original)');
  const [docBText, setDocBText] = useState<string>('');
  const [docBName, setDocBName] = useState<string>('Document B (Revised)');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Quick 1-click load demo comparison: Pune Rental v1 vs v2
  const handleLoadDemoComparison = async () => {
    try {
      setIsComparing(true);
      setCompareError(null);

      const [resA, resB] = await Promise.all([
        fetch('/samples/pune_rental_agreement.txt'),
        fetch('/samples/pune_rental_agreement_v2_revised.txt'),
      ]);

      const textA = await resA.text();
      const textB = await resB.text();

      setDocAText(textA);
      setDocAName('Original Agreement (V1)');
      setDocBText(textB);
      setDocBName('Renewal Proposal (V2)');

      await runComparison(textA, textB, 'Original (V1)', 'Renewal Proposal (V2)');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setCompareError('Failed to load demo comparison files: ' + errorMsg);
      setIsComparing(false);
    }
  };

  const runComparison = async (textA: string, textB: string, nameA: string, nameB: string) => {
    if (!textA.trim() || !textB.trim()) {
      setCompareError('Please provide text for both Document A and Document B.');
      return;
    }

    setIsComparing(true);
    setCompareError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTextA: textA,
          documentTextB: textB,
          nameA,
          nameB,
          docType: selectedDocType,
          state: selectedState,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data: CompareResult = await response.json();
      setCompareResult(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Comparison failed. Please try again.';
      setCompareError(errorMsg);
    } finally {
      setIsComparing(false);
    }
  };

  const getFavorsBadge = (favors: 'user' | 'counterparty' | 'neutral') => {
    switch (favors) {
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-risk-low-fg bg-risk-low-bg px-2.5 py-0.5 rounded-full border border-risk-low-border">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Favors you
          </span>
        );
      case 'counterparty':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-risk-high-fg bg-risk-high-bg px-2.5 py-0.5 rounded-full border border-risk-high-border">
            <AlertCircle className="w-3.5 h-3.5" />
            Favors counterparty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted bg-surface-muted px-2.5 py-0.5 rounded-full border border-border">
            <HelpCircle className="w-3.5 h-3.5" />
            Neutral
          </span>
        );
    }
  };

  return (
    <div id="compare-tab-content" className="space-y-6 pb-12">
      {/* Top Banner & Demo Load */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-primary shrink-0" />
              <h3 className="text-base font-bold text-text">Compare Two Versions</h3>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Compare an original agreement with a landlord/employer revision to see who benefits
              from each change.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadDemoComparison}
            disabled={isComparing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary-soft text-primary hover:opacity-90 border border-primary/20 transition cursor-pointer self-start sm:self-auto min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Sample Comparison</span>
          </button>
        </div>

        {/* Two Text Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Document A */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Original Version (Document A)</span>
              <span className="text-[11px] text-text-muted truncate max-w-[180px]">{docAName}</span>
            </div>
            <textarea
              rows={5}
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
              placeholder="Paste original contract text here..."
              className="w-full text-xs font-mono p-3 bg-surface-muted border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          {/* Document B */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Revised Version (Document B)</span>
              <span className="text-[11px] text-text-muted truncate max-w-[180px]">{docBName}</span>
            </div>
            <textarea
              rows={5}
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
              placeholder="Paste revised draft from counterparty here..."
              className="w-full text-xs font-mono p-3 bg-surface-muted border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-focus-ring"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {compareError && (
            <p className="text-xs text-risk-high-fg flex items-center gap-1 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{compareError}</span>
            </p>
          )}

          <button
            type="button"
            onClick={() => runComparison(docAText, docBText, docAName, docBName)}
            disabled={isComparing || !docAText.trim() || !docBText.trim()}
            className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition disabled:opacity-40 cursor-pointer min-h-[44px]"
          >
            {isComparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Finding changes...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Analyze Differences</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {compareResult && (
        <div className="space-y-5">
          {/* Top Card: Net Impact Verdict */}
          <div
            id="compare-net-impact-card"
            className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary shrink-0" />
                <h4 className="text-base font-bold text-text">Net Impact Verdict</h4>
              </div>
              <div>
                {getFavorsBadge(
                  compareResult.netImpactVerdict === 'favorable_to_user'
                    ? 'user'
                    : compareResult.netImpactVerdict === 'favorable_to_counterparty'
                      ? 'counterparty'
                      : 'neutral'
                )}
              </div>
            </div>

            <p className="text-sm sm:text-base text-text leading-relaxed font-normal">
              {compareResult.netImpactSummary}
            </p>

            {/* Counts */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border text-xs text-text-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <PlusCircle className="w-4 h-4 text-risk-low-fg" />
                <strong>{compareResult.addedClauses.length}</strong> Added
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MinusCircle className="w-4 h-4 text-risk-high-fg" />
                <strong>{compareResult.removedClauses.length}</strong> Removed
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <RefreshCw className="w-4 h-4 text-primary" />
                <strong>{compareResult.changedClauses.length}</strong> Modified
              </span>
            </div>
          </div>

          {/* Changed Clauses */}
          {compareResult.changedClauses.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Modified Clauses ({compareResult.changedClauses.length})
              </span>
              <div className="space-y-3">
                {compareResult.changedClauses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-bold text-text">{item.title}</h5>
                      {getFavorsBadge(item.favors)}
                    </div>

                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {item.explanationOfChange}
                    </p>

                    {/* Stacked on mobile, side-by-side on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-surface-muted/70 border border-border space-y-1">
                        <span className="text-[11px] font-bold uppercase text-text-muted block">
                          Before (Original)
                        </span>
                        <blockquote className="font-mono text-text italic">
                          &ldquo;{item.quoteDocA}&rdquo;
                        </blockquote>
                      </div>

                      <div className="p-3 rounded-xl bg-primary-soft/30 border border-primary/20 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-primary block">
                          After (Revised)
                        </span>
                        <blockquote className="font-mono text-text italic">
                          &ldquo;{item.quoteDocB}&rdquo;
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added Clauses */}
          {compareResult.addedClauses.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Newly Added Clauses ({compareResult.addedClauses.length})
              </span>
              <div className="space-y-3">
                {compareResult.addedClauses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-risk-low-fg" />
                        <h5 className="text-sm font-bold text-text">{item.title}</h5>
                      </div>
                      {getFavorsBadge(item.favors)}
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {item.explanation}
                    </p>
                    <QuoteBlock quote={item.quoteDocB} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed Clauses */}
          {compareResult.removedClauses.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Deleted / Removed Clauses ({compareResult.removedClauses.length})
              </span>
              <div className="space-y-3">
                {compareResult.removedClauses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MinusCircle className="w-4 h-4 text-risk-high-fg" />
                        <h5 className="text-sm font-bold text-text">{item.title}</h5>
                      </div>
                      {getFavorsBadge(item.favors)}
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {item.explanation}
                    </p>
                    <QuoteBlock quote={item.quoteDocA} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
