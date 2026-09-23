'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { RiskChip } from './RiskChip';
import { QuoteBlock } from './QuoteBlock';
import { ListenButton } from './ListenButton';

export interface ClauseData {
  id: string;
  title: string;
  verbatimQuote: string;
  pageNumber?: number;
  plainExplanation?: string;
  explanationSimple?: string;
  oneLineSummary?: string;
  risk?: 'low' | 'medium' | 'high';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'low' | 'medium' | 'high';
  whyItMatters: string;
  category?: string;
  clauseNumber?: string;
  isVerified?: boolean;
  isHallucinationRisk?: boolean;
  suggestedNegotiation?: string;
}

interface ClauseCardProps {
  clause: ClauseData;
  onCitationClick?: (pageNumber?: number, quote?: string) => void;
  onAskClause?: (clause: ClauseData) => void;
  defaultExpanded?: boolean;
  className?: string;
  id?: string;
}

export function ClauseCard({
  clause,
  onCitationClick,
  onAskClause,
  defaultExpanded = false,
  className = '',
  id,
}: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Normalize risk
  const rawRisk = (clause.risk || clause.riskLevel || 'low').toLowerCase() as
    'low' | 'medium' | 'high';

  const explanation = clause.plainExplanation || clause.explanationSimple || clause.whyItMatters;

  const consequenceText = clause.whyItMatters || clause.oneLineSummary || explanation;

  return (
    <div
      id={id || `clause-card-${clause.id}`}
      className={`rounded-2xl border transition-all bg-surface overflow-hidden ${
        rawRisk === 'high'
          ? 'border-risk-high-border/70 shadow-xs'
          : rawRisk === 'medium'
            ? 'border-risk-med-border/70 shadow-xs'
            : 'border-border shadow-xs'
      } ${className}`}
    >
      {/* Collapsed Header (Tap anywhere to expand/collapse) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-surface-muted/50 active:bg-surface-muted transition cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-text">{clause.title}</h4>
            <RiskChip level={rawRisk} size="sm" />
            {clause.category && (
              <span className="text-[11px] font-medium text-text-muted px-2 py-0.5 rounded-lg bg-surface-muted border border-border capitalize">
                {clause.category.replace(/-/g, ' ')}
              </span>
            )}
            {clause.pageNumber && (
              <span className="text-[11px] font-medium text-text-muted px-2 py-0.5 rounded-lg bg-surface-muted border border-border">
                Page {clause.pageNumber}
              </span>
            )}
            {clause.isVerified === false && <RiskChip level="unverified" size="sm" />}
          </div>

          {/* One-line consequence (always visible) */}
          <p className="text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed">
            {consequenceText}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-muted shrink-0 mt-0.5">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-border space-y-4">
          {/* Plain explanation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                What this means in plain words
              </span>
              <ListenButton
                textToRead={`${clause.title}. ${explanation}. ${clause.whyItMatters || ''}`}
                label="Listen"
              />
            </div>
            <p className="text-xs sm:text-sm text-text leading-relaxed">{explanation}</p>
          </div>

          {/* Exact Quote */}
          {clause.verbatimQuote && (
            <QuoteBlock
              quote={clause.verbatimQuote}
              pageNumber={clause.pageNumber}
              clauseReference={clause.clauseNumber ? `Clause ${clause.clauseNumber}` : undefined}
              onCitationClick={() => onCitationClick?.(clause.pageNumber, clause.verbatimQuote)}
            />
          )}

          {/* Why It Matters */}
          {clause.whyItMatters && (
            <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
                <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Why it matters to you</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{clause.whyItMatters}</p>
            </div>
          )}

          {/* Negotiation / Action point */}
          {clause.suggestedNegotiation && (
            <div className="p-3.5 rounded-xl bg-primary-soft/30 border border-primary/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>What to ask or propose</span>
              </div>
              <p className="text-xs text-text leading-relaxed">{clause.suggestedNegotiation}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => onCitationClick?.(clause.pageNumber, clause.verbatimQuote)}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 min-h-[40px]"
            >
              See original in document &rarr;
            </button>

            {onAskClause && (
              <button
                type="button"
                onClick={() => onAskClause(clause)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs min-h-[44px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask about this clause</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
