'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  FileQuestion,
  ChevronDown,
} from 'lucide-react';
import {
  ClauseCard as SchemaClauseCard,
  MissingProtection,
  InconsistencyItem,
} from '@/lib/schemas';
import { ClauseCard, ClauseData } from '@/components/ui/ClauseCard';
import { RiskChip } from '@/components/ui/RiskChip';
import { InconsistenciesCard } from '@/components/ui/InconsistenciesCard';

interface ClausesTabProps {
  clauses: SchemaClauseCard[];
  missingProtections: MissingProtection[];
  inconsistencies?: InconsistencyItem[];
  onSelectCitation: (quote: string, pageNumber: number) => void;
  onAskClause?: (clause: ClauseData) => void;
  onAskQuestion?: (question: string) => void;
  isScanned?: boolean;
}

export function ClausesTab({
  clauses,
  missingProtections,
  inconsistencies = [],
  onSelectCitation,
  onAskClause,
  onAskQuestion,
  isScanned = false,
}: ClausesTabProps) {
  const [selectedRisk, setSelectedRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Counts for filters
  const riskCounts = useMemo(() => {
    return {
      all: clauses.length,
      high: clauses.filter((c) => c.risk === 'high').length,
      medium: clauses.filter((c) => c.risk === 'medium').length,
      low: clauses.filter((c) => c.risk === 'low').length,
    };
  }, [clauses]);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    clauses.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [clauses]);

  // Sorted and filtered clauses (HIGH RISK FIRST ALWAYS)
  const sortedAndFilteredClauses = useMemo(() => {
    const riskRank: Record<string, number> = { high: 0, medium: 1, low: 2 };

    const filtered = clauses.filter((c) => {
      const matchRisk = selectedRisk === 'all' || c.risk === selectedRisk;
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchSearch =
        !searchFilter.trim() ||
        c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.plainExplanation.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.verbatimQuote.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.whyItMatters.toLowerCase().includes(searchFilter.toLowerCase());

      return matchRisk && matchCat && matchSearch;
    });

    // Sort: high risk first, then medium, then low
    return [...filtered].sort((a, b) => {
      const rankA = riskRank[a.risk] ?? 3;
      const rankB = riskRank[b.risk] ?? 3;
      return rankA - rankB;
    });
  }, [clauses, selectedRisk, selectedCategory, searchFilter]);

  return (
    <div id="clauses-tab-content" className="space-y-5 pb-12">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[53px] sm:top-[57px] z-20 bg-background/95 backdrop-blur-md pt-2 pb-3 border-b border-border -mx-1 px-1 space-y-3">
        {/* Search input & Category dropdown */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clauses (e.g. deposit, notice, penalty)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-surface border border-border text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          {categories.length > 0 && (
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-medium bg-surface border border-border text-text focus:outline-hidden focus:ring-2 focus:ring-focus-ring cursor-pointer appearance-none pr-8 min-h-[40px]"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Sticky Risk Filter Chips (All, Be careful, Check this, Looks fair) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedRisk('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[36px] ${
              selectedRisk === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-surface border border-border text-text hover:bg-surface-muted'
            }`}
          >
            <span>All Clauses</span>
            <span className="text-[11px] opacity-80">({riskCounts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRisk('high')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[36px] ${
              selectedRisk === 'high'
                ? 'bg-risk-high-fg text-white shadow-xs'
                : 'bg-risk-high-bg border border-risk-high-border text-risk-high-fg hover:opacity-90'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Be careful</span>
            <span className="text-[11px] font-bold">({riskCounts.high})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRisk('medium')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[36px] ${
              selectedRisk === 'medium'
                ? 'bg-risk-med-fg text-white shadow-xs'
                : 'bg-risk-med-bg border border-risk-med-border text-risk-med-fg hover:opacity-90'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Check this</span>
            <span className="text-[11px] font-bold">({riskCounts.medium})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRisk('low')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[36px] ${
              selectedRisk === 'low'
                ? 'bg-risk-low-fg text-white shadow-xs'
                : 'bg-risk-low-bg border border-risk-low-border text-risk-low-fg hover:opacity-90'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Looks fair</span>
            <span className="text-[11px] font-bold">({riskCounts.low})</span>
          </button>
        </div>
      </div>

      {/* Inconsistencies & Contradictions Card */}
      {inconsistencies && inconsistencies.length > 0 && (
        <InconsistenciesCard
          inconsistencies={inconsistencies}
          onSelectCitation={onSelectCitation}
          onAskQuestion={onAskQuestion}
        />
      )}

      {/* Clauses List */}
      <div className="space-y-3">
        {sortedAndFilteredClauses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface text-text-muted space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-text-muted opacity-50" />
            <p className="text-sm font-semibold text-text">No clauses match your filter</p>
            <p className="text-xs text-text-muted">
              Try clearing the search text or switching back to &ldquo;All Clauses&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedRisk('all');
                setSelectedCategory('all');
                setSearchFilter('');
              }}
              className="mt-2 text-xs font-semibold text-primary underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          sortedAndFilteredClauses.map((clause, idx) => (
            <ClauseCard
              key={clause.id}
              clause={{
                ...clause,
                riskLevel: clause.risk.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
              }}
              defaultExpanded={idx === 0 && clause.risk === 'high'}
              onCitationClick={(page, quote) => {
                onSelectCitation(quote || clause.verbatimQuote, page || clause.pageNumber || 1);
              }}
              onAskClause={onAskClause}
            />
          ))
        )}
      </div>

      {/* "Not Found in This Document" Section (Dashed border, grey icons, listing standard missing protections) */}
      {missingProtections && missingProtections.length > 0 && (
        <div
          id="not-found-in-document-section"
          className="mt-8 pt-4 rounded-2xl border-2 border-dashed border-border bg-surface-muted/40 p-5 sm:p-6 space-y-4 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border text-text-muted flex items-center justify-center shrink-0">
              <FileQuestion className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text">
                Not Found in This Document
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Standard rights and protections that are typically expected under Indian tenancy or
                contract practices, but are completely absent here:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {missingProtections.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border bg-surface space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-text-muted shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-text">{item.topic}</h4>
                </div>

                <div className="space-y-1 text-xs text-text-muted leading-relaxed">
                  <p>
                    <strong className="text-text font-medium">Why it was expected:</strong>{' '}
                    {item.whyExpected}
                  </p>
                  <p>
                    <strong className="text-text font-medium">Practical risk:</strong>{' '}
                    {item.practicalRisk}
                  </p>
                  <p className="text-primary font-medium bg-primary-soft/40 p-2 rounded-lg border border-primary/20">
                    &bull; Recommended: {item.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
