'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  FileQuestion,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { InconsistencyItem } from '@/lib/schemas';

interface InconsistenciesCardProps {
  inconsistencies: InconsistencyItem[];
  onSelectCitation?: (quote: string, pageNumber: number) => void;
  onAskQuestion?: (question: string) => void;
  id?: string;
}

export function InconsistenciesCard({
  inconsistencies,
  onSelectCitation,
  onAskQuestion,
  id = 'inconsistencies-banner-card',
}: InconsistenciesCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(
    inconsistencies.length > 0 ? inconsistencies[0].id : null
  );

  if (!inconsistencies || inconsistencies.length === 0) {
    return null;
  }

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-risk-high-bg text-risk-high border border-risk-high/30">
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-risk-med-bg text-risk-med border border-risk-med/30">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Check This
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-muted text-text-muted border border-border">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            Minor
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'words_vs_figures_mismatch':
        return 'Words vs Figures Mismatch';
      case 'conflicting_obligations':
        return 'Conflicting Obligations';
      case 'unfilled_placeholder':
        return 'Unfilled Blank / Placeholder';
      case 'party_or_date_mismatch':
        return 'Party or Date Mismatch';
      default:
        return 'Contradiction';
    }
  };

  const highSeverityCount = inconsistencies.filter((i) => i.severity === 'high').length;

  return (
    <div
      id={id}
      className="rounded-xl border border-risk-high/30 bg-risk-high-bg/25 overflow-hidden shadow-xs transition-all"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-risk-high/20 bg-risk-high-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-risk-high/15 border border-risk-high/30 flex items-center justify-center text-risk-high shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                Internal Inconsistencies & Contradictions
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-risk-high text-white">
                {inconsistencies.length} found
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              These clauses or numbers contradict each other or have unfilled blanks. Clarify with
              the other party before signing.
            </p>
          </div>
        </div>

        {highSeverityCount > 0 && (
          <div className="inline-flex items-center gap-1.5 text-xs text-risk-high font-medium bg-surface/70 px-3 py-1.5 rounded-lg border border-risk-high/30 shrink-0 self-start sm:self-auto">
            <span>{highSeverityCount} high-risk discrepancies</span>
          </div>
        )}
      </div>

      {/* List of Inconsistencies */}
      <div className="divide-y divide-border/60 bg-surface/80">
        {inconsistencies.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id || `inc-${idx}`}
              className="p-4 sm:p-5 hover:bg-surface-muted/30 transition-colors"
            >
              {/* Item Header / Accordion trigger */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-semibold text-text-muted shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm sm:text-base text-text">{item.title}</h4>
                      {getSeverityBadge(item.severity)}
                      <span className="text-xs px-2 py-0.5 rounded-md bg-surface-muted text-text-muted border border-border">
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-text-muted p-1 rounded-md hover:bg-surface-muted">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border/70 space-y-4 pl-0 sm:pl-9 animate-in fade-in duration-150">
                  {/* Conflicting Quotes Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Quote A */}
                    <div className="rounded-lg border border-border bg-surface p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                        <span className="uppercase tracking-wider font-semibold text-text">
                          Provision A
                        </span>
                        {onSelectCitation ? (
                          <button
                            type="button"
                            onClick={() => onSelectCitation(item.quoteA, item.pageA || 1)}
                            className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
                          >
                            <span>Page {item.pageA || 1}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span>Page {item.pageA || 1}</span>
                        )}
                      </div>
                      <blockquote className="text-xs sm:text-sm italic font-serif text-text border-l-2 border-primary/50 pl-2.5 py-0.5 bg-primary/5 rounded-r-md">
                        &ldquo;{item.quoteA}&rdquo;
                      </blockquote>
                    </div>

                    {/* Quote B (or placeholder note) */}
                    <div className="rounded-lg border border-border bg-surface p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                        <span className="uppercase tracking-wider font-semibold text-text">
                          {item.quoteB ? 'Conflicting Provision B' : 'Status'}
                        </span>
                        {item.quoteB && onSelectCitation ? (
                          <button
                            type="button"
                            onClick={() => onSelectCitation(item.quoteB, item.pageB || 1)}
                            className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
                          >
                            <span>Page {item.pageB || 1}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : item.quoteB ? (
                          <span>Page {item.pageB || 1}</span>
                        ) : (
                          <span className="text-risk-high font-semibold">Unfilled Blank</span>
                        )}
                      </div>
                      {item.quoteB ? (
                        <blockquote className="text-xs sm:text-sm italic font-serif text-text border-l-2 border-risk-high/50 pl-2.5 py-0.5 bg-risk-high-bg/50 rounded-r-md">
                          &ldquo;{item.quoteB}&rdquo;
                        </blockquote>
                      ) : (
                        <p className="text-xs text-text-muted py-2 italic">
                          This field or date is blank (&ldquo;_____&rdquo;) in the draft document.
                          Must be filled prior to execution.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* "What to Ask to Clarify" Callout Box */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>What to ask the other party to clarify</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(item.id, item.whatToAskToClarify)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-surface border border-border hover:bg-surface-muted text-text font-medium cursor-pointer transition-colors"
                        title="Copy question to clipboard"
                      >
                        {isCopied ? (
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
                    </div>

                    <p className="text-xs sm:text-sm text-text font-medium leading-relaxed bg-surface/60 p-2.5 rounded-md border border-border/50">
                      &ldquo;{item.whatToAskToClarify}&rdquo;
                    </p>

                    {onAskQuestion && (
                      <div className="mt-2.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            onAskQuestion(
                              `Could you explain how to resolve this contradiction: ${item.title}? Quote A says "${item.quoteA}", while Quote B says "${item.quoteB}".`
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask AI assistant about this discrepancy &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
