'use client';

import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

interface RiskSnapshotProps {
  highCount: number;
  medCount: number;
  lowCount: number;
  overallScore?: number;
  documentTypeName?: string;
  onFilterClick?: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  className?: string;
  id?: string;
}

export function RiskSnapshot({
  highCount,
  medCount,
  lowCount,
  overallScore = 50,
  documentTypeName,
  onFilterClick,
  className = '',
  id,
}: RiskSnapshotProps) {
  const total = highCount + medCount + lowCount;
  const safeTotal = total > 0 ? total : 1;

  const highPct = Math.round((highCount / safeTotal) * 100);
  const medPct = Math.round((medCount / safeTotal) * 100);
  const lowPct = Math.max(0, 100 - highPct - medPct);

  // Friendly summary sentence in plain 8th-grade words
  let headlineSentence = 'Everything looks standard in this agreement.';
  if (highCount > 0) {
    headlineSentence = `${highCount} ${
      highCount === 1 ? 'critical clause needs' : 'critical clauses need'
    } your attention before you sign.`;
  } else if (medCount > 0) {
    headlineSentence = `${medCount} ${
      medCount === 1 ? 'clause is worth checking' : 'clauses are worth checking'
    } with the other party.`;
  }

  return (
    <div
      id={id}
      className={`p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs transition-colors ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
            Risk Snapshot
          </span>
          <h3 className="text-base sm:text-lg font-bold text-text mt-0.5">{headlineSentence}</h3>
          {documentTypeName && (
            <p className="text-xs text-text-muted mt-0.5">
              Analyzed as: <span className="font-medium text-text">{documentTypeName}</span>
            </p>
          )}
        </div>

        {/* Calm score pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-muted px-3.5 py-1.5 rounded-xl border border-border">
          {highCount > 0 ? (
            <ShieldAlert className="w-4 h-4 text-risk-high-fg" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-risk-low-fg" />
          )}
          <span className="text-xs font-semibold text-text">
            Overall Fairness:{' '}
            <span className="text-primary font-bold">{Math.max(0, 100 - overallScore)}/100</span>
          </span>
        </div>
      </div>

      {/* Segmented Risk Bar */}
      <div className="space-y-2">
        <div
          className="h-3 w-full rounded-full bg-surface-muted overflow-hidden flex"
          role="progressbar"
          aria-label="Proportion of risk categories in document"
        >
          {highCount > 0 && (
            <div
              style={{ width: `${highPct}%` }}
              className="bg-risk-high-fg transition-all duration-500"
              title={`Be careful: ${highCount} clauses`}
            />
          )}
          {medCount > 0 && (
            <div
              style={{ width: `${medPct}%` }}
              className="bg-risk-med-fg transition-all duration-500"
              title={`Check this: ${medCount} clauses`}
            />
          )}
          {lowCount > 0 && (
            <div
              style={{ width: `${lowPct}%` }}
              className="bg-risk-low-fg transition-all duration-500"
              title={`Looks fair: ${lowCount} clauses`}
            />
          )}
        </div>

        {/* Legend / Interactive Toggles */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => onFilterClick?.('high')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-risk-high-bg border border-risk-high-border text-risk-high-fg hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>Be careful</span>
            </div>
            <span className="text-sm font-bold">{highCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterClick?.('medium')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-risk-med-bg border border-risk-med-border text-risk-med-fg hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Check this</span>
            </div>
            <span className="text-sm font-bold">{medCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterClick?.('low')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-risk-low-bg border border-risk-low-border text-risk-low-fg hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Looks fair</span>
            </div>
            <span className="text-sm font-bold">{lowCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
