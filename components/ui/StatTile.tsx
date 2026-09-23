'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  badge?: string;
  highlight?: boolean;
  className?: string;
  id?: string;
}

export function StatTile({
  label,
  value,
  subValue,
  icon: Icon,
  badge,
  highlight = false,
  className = '',
  id,
}: StatTileProps) {
  return (
    <div
      id={id}
      className={`relative p-4 rounded-2xl border transition-all shadow-xs bg-surface ${
        highlight ? 'border-primary/40 bg-primary-soft/30 ring-1 ring-primary/20' : 'border-border'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center text-primary shrink-0">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-text">
          {value || '—'}
        </span>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-surface-muted text-text-muted">
            {badge}
          </span>
        )}
      </div>

      {subValue && (
        <p className="text-xs text-text-muted mt-1 leading-normal line-clamp-1">{subValue}</p>
      )}
    </div>
  );
}
