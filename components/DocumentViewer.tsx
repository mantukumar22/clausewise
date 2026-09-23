'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

interface DocumentViewerProps {
  fileName: string;
  pages: string[];
  totalPages: number;
  isScanned?: boolean;
  activeCitation?: {
    quote: string;
    pageNumber: number;
  } | null;
  onClearActiveCitation?: () => void;
}

export function DocumentViewer({
  fileName,
  pages,
  totalPages,
  isScanned = false,
  activeCitation,
  onClearActiveCitation,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(13);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'paginated' | 'continuous'>('paginated');

  const highlightRef = useRef<HTMLSpanElement>(null);

  // When an active citation is triggered, jump to its page and scroll to highlight
  useEffect(() => {
    if (activeCitation && activeCitation.pageNumber) {
      const targetPage = Math.min(Math.max(1, activeCitation.pageNumber), totalPages || 1);
      const timer = setTimeout(() => {
        setCurrentPage(targetPage);
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeCitation, totalPages]);

  const handleCopyText = () => {
    const fullText = pages.join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPageText = pages[currentPage - 1] || '';

  const renderHighlightedText = (text: string) => {
    const targetQuote = activeCitation?.quote?.trim();

    if (!targetQuote && !searchQuery.trim()) {
      return <span>{text}</span>;
    }

    // Active citation highlight
    if (targetQuote && targetQuote.length > 5) {
      const lowerText = text.toLowerCase();
      const lowerQuote = targetQuote.toLowerCase();
      const idx = lowerText.indexOf(lowerQuote);

      if (idx !== -1) {
        const before = text.substring(0, idx);
        const match = text.substring(idx, idx + targetQuote.length);
        const after = text.substring(idx + targetQuote.length);

        return (
          <span>
            {before}
            <mark
              ref={highlightRef}
              className="bg-primary/20 text-text px-1.5 py-0.5 rounded font-semibold ring-2 ring-primary transition-all"
            >
              {match}
            </mark>
            {after}
          </span>
        );
      }

      // Try highlighting first 4 significant words if exact string isn't an unbroken match
      const words = targetQuote.split(/\s+/).filter((w) => w.length > 3);
      if (words.length >= 2) {
        const subPhrase = words.slice(0, 4).join(' ').toLowerCase();
        const subIdx = lowerText.indexOf(subPhrase);
        if (subIdx !== -1) {
          const before = text.substring(0, subIdx);
          const match = text.substring(subIdx, subIdx + subPhrase.length);
          const after = text.substring(subIdx + subPhrase.length);

          return (
            <span>
              {before}
              <mark
                ref={highlightRef}
                className="bg-primary/20 text-text px-1.5 py-0.5 rounded font-semibold ring-2 ring-primary"
              >
                {match}
              </mark>
              {after}
            </span>
          );
        }
      }
    }

    // Highlight search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const parts = text.split(new RegExp(`(${q})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) =>
            part.toLowerCase() === q ? (
              <mark key={i} className="bg-primary-soft text-primary font-bold px-1 rounded">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </span>
      );
    }

    return <span>{text}</span>;
  };

  return (
    <div
      id="document-viewer-container"
      className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-xs"
    >
      {/* Viewer Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-surface-muted/60 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span
            className="text-xs font-bold text-text truncate max-w-[180px] sm:max-w-[240px]"
            title={fileName}
          >
            {fileName}
          </span>
          {isScanned && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-risk-med-bg text-risk-med-fg border border-risk-med-border font-medium shrink-0"
              title="Transcribed via OCR"
            >
              OCR Scan
            </span>
          )}
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFontSize((f) => Math.max(11, f - 1))}
            className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Smaller font"
            aria-label="Smaller font"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-text-muted w-5 text-center">{fontSize}</span>
          <button
            type="button"
            onClick={() => setFontSize((f) => Math.min(20, f + 1))}
            className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Larger font"
            aria-label="Larger font"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-text bg-surface hover:bg-surface-muted border border-border rounded-lg transition cursor-pointer min-h-[32px]"
            title="Copy document text"
          >
            {copied ? <Check className="w-3 h-3 text-risk-low-fg" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'paginated' ? 'continuous' : 'paginated'))}
            className="px-2.5 py-1 text-[11px] font-semibold text-primary bg-primary-soft hover:opacity-90 rounded-lg transition cursor-pointer min-h-[32px]"
          >
            {viewMode === 'paginated' ? 'Continuous' : 'Paginated'}
          </button>
        </div>
      </div>

      {/* Search & Active Citation Bar */}
      <div className="px-3.5 py-2 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
          <input
            id="document-viewer-search-input"
            type="text"
            placeholder="Search within text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-surface-muted border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-focus-ring"
          />
        </div>

        {activeCitation && (
          <div className="flex items-center gap-2 bg-primary-soft text-primary border border-primary/20 px-2.5 py-1 rounded-xl text-xs max-w-full truncate">
            <span className="font-bold shrink-0">Page {activeCitation.pageNumber}:</span>
            <span className="truncate italic max-w-[200px]">
              &ldquo;{activeCitation.quote}&rdquo;
            </span>
            {onClearActiveCitation && (
              <button
                type="button"
                onClick={onClearActiveCitation}
                className="text-primary hover:opacity-75 font-bold shrink-0 cursor-pointer p-0.5"
                title="Clear citation highlight"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {isScanned && (
        <div className="px-3.5 py-1.5 bg-risk-med-bg text-risk-med-fg border-b border-risk-med-border text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Scanned agreement mode: extracted text is transcribed with OCR.</span>
        </div>
      )}

      {/* Content Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface">
        {viewMode === 'paginated' ? (
          <div
            className="whitespace-pre-wrap font-serif leading-relaxed text-text max-w-prose mx-auto select-text"
            style={{ fontSize: `${fontSize}px` }}
          >
            {renderHighlightedText(currentPageText)}
          </div>
        ) : (
          <div className="space-y-6 max-w-prose mx-auto">
            {pages.map((p, idx) => (
              <div key={idx} className="space-y-2 pb-6 border-b border-border/60">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Page {idx + 1} of {totalPages}
                </div>
                <div
                  className="whitespace-pre-wrap font-serif leading-relaxed text-text select-text"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {renderHighlightedText(p)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Pagination for Paginated mode */}
      {viewMode === 'paginated' && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-muted/60 border-t border-border text-xs">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-text disabled:opacity-40 hover:bg-surface-muted transition cursor-pointer min-h-[36px]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="font-semibold text-text text-xs">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-text disabled:opacity-40 hover:bg-surface-muted transition cursor-pointer min-h-[36px]"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
