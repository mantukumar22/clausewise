'use client';

import React from 'react';
import { Quote, FileText } from 'lucide-react';

interface QuoteBlockProps {
  quote: string;
  pageNumber?: number;
  clauseReference?: string;
  onCitationClick?: () => void;
  className?: string;
  id?: string;
}

export function QuoteBlock({
  quote,
  pageNumber,
  clauseReference,
  onCitationClick,
  className = '',
  id,
}: QuoteBlockProps) {
  if (!quote) return null;

  return (
    <div
      id={id}
      className={`rounded-r-xl border-l-4 border-primary bg-surface-muted p-3.5 sm:p-4 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-text-muted">
        <span className="flex items-center gap-1 font-medium">
          <Quote className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>Exact Words from Agreement</span>
        </span>
        {(clauseReference || pageNumber) && (
          <button
            type="button"
            onClick={onCitationClick}
            disabled={!onCitationClick}
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition ${
              onCitationClick
                ? 'text-primary hover:bg-primary-soft cursor-pointer'
                : 'text-text-muted cursor-default'
            }`}
            title={onCitationClick ? 'Click to view in document' : undefined}
          >
            <FileText className="w-3 h-3" />
            <span>
              {clauseReference ? clauseReference : ''}
              {clauseReference && pageNumber ? ' • ' : ''}
              {pageNumber ? `Page ${pageNumber}` : ''}
            </span>
          </button>
        )}
      </div>

      <blockquote className="font-mono text-xs sm:text-sm text-text leading-relaxed italic whitespace-pre-wrap selection:bg-highlight selection:text-text">
        &ldquo;{quote.trim()}&rdquo;
      </blockquote>
    </div>
  );
}
