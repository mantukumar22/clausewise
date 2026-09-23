'use client';

import React, { useState } from 'react';
import {
  Calendar,
  IndianRupee,
  ShieldAlert,
  Clock,
  MessageSquareShare,
  Check,
  Copy,
  Calculator,
} from 'lucide-react';
import { AnalyzeResult } from '@/lib/schemas';
import { RiskSnapshot } from '@/components/ui/RiskSnapshot';
import { StatTile } from '@/components/ui/StatTile';
import { FormalitiesCard } from '../FormalitiesCard';
import { RentMathCalculator } from '../RentMathCalculator';
import { ListenButton } from '@/components/ui/ListenButton';

interface SummaryTabProps {
  analysis: AnalyzeResult;
  selectedState: string;
  onOpenWhatsAppModal: () => void;
  onNavigateToClauses?: (filter?: 'all' | 'high' | 'medium' | 'low') => void;
}

export function SummaryTab({
  analysis,
  selectedState,
  onOpenWhatsAppModal,
  onNavigateToClauses,
}: SummaryTabProps) {
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const { plainSummary, formalitiesCheck, rentalMathExtracted, clauses } = analysis;

  // Counts for Risk Snapshot
  const highCount = (clauses || []).filter((c) => c.risk === 'high').length;
  const medCount = (clauses || []).filter((c) => c.risk === 'medium').length;
  const lowCount = (clauses || []).filter((c) => c.risk === 'low').length;
  const overallScore = Math.max(15, Math.min(100, 100 - (highCount * 25 + medCount * 10)));

  const handleCopyWhatAmIAgreeingTo = () => {
    navigator.clipboard.writeText(plainSummary.whatAmIAgreeingTo);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Helper to format rupees in lakh format where relevant
  const formatMoney = (val?: number | string): string => {
    if (!val && val !== 0) return '—';
    if (typeof val === 'number') {
      if (val >= 100000) {
        return `₹${(val / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
      }
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return String(val);
  };

  return (
    <div id="summary-tab-content" className="space-y-6 pb-12">
      {/* 1. Overall "Risk Snapshot" */}
      <RiskSnapshot
        id="summary-risk-snapshot"
        highCount={highCount}
        medCount={medCount}
        lowCount={lowCount}
        overallScore={overallScore}
        onFilterClick={(filter) => onNavigateToClauses?.(filter)}
      />

      {/* 2. "What am I agreeing to?" Card (short, large text) */}
      <div
        id="what-am-i-agreeing-to-card"
        className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs relative overflow-hidden transition-colors"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
            Plain Language Overview
          </span>
          <div className="flex items-center gap-2">
            <ListenButton textToRead={plainSummary.whatAmIAgreeingTo} label="Listen" />

            <button
              type="button"
              onClick={handleCopyWhatAmIAgreeingTo}
              className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text px-2.5 py-1 rounded-lg border border-border bg-surface-muted transition cursor-pointer"
              title="Copy summary to clipboard"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-risk-low-fg" />
                  <span className="text-risk-low-fg">Copied</span>
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
              onClick={onOpenWhatsAppModal}
              className="flex items-center gap-1 text-xs font-semibold text-risk-low-fg hover:opacity-90 px-2.5 py-1 rounded-lg border border-risk-low-border bg-risk-low-bg transition cursor-pointer"
              title="Share brief via WhatsApp"
            >
              <MessageSquareShare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>

        <h3 className="text-sm font-bold text-primary mb-2">What am I agreeing to?</h3>

        <p className="text-base sm:text-lg text-text leading-relaxed font-normal">
          {plainSummary.whatAmIAgreeingTo}
        </p>

        {/* Parties involved chips */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="font-semibold text-text">Your role:</span>
          <span className="px-2 py-0.5 rounded-lg bg-surface-muted border border-border font-medium text-text">
            {plainSummary.parties.userRole}
            {plainSummary.parties.userName ? ` (${plainSummary.parties.userName})` : ''}
          </span>
          <span className="font-semibold text-text ml-2">Other party:</span>
          <span className="px-2 py-0.5 rounded-lg bg-surface-muted border border-border font-medium text-text">
            {plainSummary.parties.counterpartyRole}
            {plainSummary.parties.counterpartyName
              ? ` (${plainSummary.parties.counterpartyName})`
              : ''}
          </span>
        </div>
      </div>

      {/* 3. Formalities Check Card (Found / Not found / Unclear chips) */}
      {formalitiesCheck && <FormalitiesCard formalities={formalitiesCheck} />}

      {/* 4. Key Numbers Row: Big-number tiles */}
      <div id="summary-key-numbers-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
            Key Financials & Timelines
          </span>
          {rentalMathExtracted && (
            <button
              type="button"
              onClick={() => setShowCalculator(!showCalculator)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{showCalculator ? 'Hide escalation math' : 'Explore compounding math'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tile 1: Rent / Periodic Fee */}
          <StatTile
            id="stat-tile-rent"
            label="Monthly Fee / Rent"
            value={
              rentalMathExtracted?.monthlyRent
                ? formatMoney(rentalMathExtracted.monthlyRent)
                : plainSummary.moneyObligations?.match(/₹[\d,]+/)?.[0] || '—'
            }
            subValue={
              rentalMathExtracted?.escalationPercent
                ? `Escalates ${rentalMathExtracted.escalationPercent}%/yr`
                : 'Payable monthly'
            }
            icon={IndianRupee}
            highlight
          />

          {/* Tile 2: Security Deposit */}
          <StatTile
            id="stat-tile-deposit"
            label="Security Deposit"
            value={
              rentalMathExtracted?.securityDeposit
                ? formatMoney(rentalMathExtracted.securityDeposit)
                : '—'
            }
            subValue={
              rentalMathExtracted?.monthlyRent && rentalMathExtracted?.securityDeposit
                ? `${Math.round(
                    rentalMathExtracted.securityDeposit / rentalMathExtracted.monthlyRent
                  )} months rent`
                : 'Refundable on exit'
            }
            icon={ShieldAlert}
          />

          {/* Tile 3: Duration */}
          <StatTile
            id="stat-tile-duration"
            label="Agreement Duration"
            value={plainSummary.termDuration?.split('(')[0]?.trim() || '11 Months'}
            subValue={
              plainSummary.termDuration?.includes('from') ? plainSummary.termDuration : 'Fixed term'
            }
            icon={Calendar}
          />

          {/* Tile 4: Notice Period & Exit */}
          <StatTile
            id="stat-tile-notice"
            label="Notice Period"
            value={
              plainSummary.terminationConditions?.match(/\d+\s*(?:days|months|day|month)/i)?.[0] ||
              'See clauses'
            }
            subValue="Required before moving out"
            icon={Clock}
          />
        </div>

        {/* Optional Escalation Calculator */}
        {showCalculator && (
          <div className="pt-2">
            <RentMathCalculator
              initialMonthlyRent={rentalMathExtracted?.monthlyRent}
              initialDeposit={rentalMathExtracted?.securityDeposit}
              initialEscalationPercent={rentalMathExtracted?.escalationPercent}
              initialTermMonths={rentalMathExtracted?.termMonths}
              state={selectedState}
            />
          </div>
        )}
      </div>
    </div>
  );
}
