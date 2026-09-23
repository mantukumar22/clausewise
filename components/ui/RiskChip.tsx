'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { RiskLevel } from '@/lib/schemas';

interface RiskChipProps {
  level: RiskLevel | 'unverified';
  customLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export function RiskChip({ level, customLabel, size = 'md', className = '', id }: RiskChipProps) {
  const normalizedLevel = (level || 'low').toLowerCase();

  let config = {
    label: customLabel || 'Looks fair',
    icon: CheckCircle2,
    classes: 'bg-risk-low-bg text-risk-low-fg border-risk-low-border',
  };

  if (normalizedLevel === 'high' || normalizedLevel === 'critical') {
    config = {
      label: customLabel || 'Be careful',
      icon: AlertOctagon,
      classes: 'bg-risk-high-bg text-risk-high-fg border-risk-high-border',
    };
  } else if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') {
    config = {
      label: customLabel || 'Check this',
      icon: AlertTriangle,
      classes: 'bg-risk-med-bg text-risk-med-fg border-risk-med-border',
    };
  } else if (normalizedLevel === 'unverified') {
    config = {
      label: customLabel || "Couldn't verify quote",
      icon: HelpCircle,
      classes:
        'bg-risk-unverified-bg text-risk-unverified-fg border-risk-unverified-border border-dashed',
    };
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm font-medium gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border shrink-0 font-medium select-none ${sizeClasses} ${config.classes} ${className}`}
      role="status"
      aria-label={`Risk level: ${config.label}`}
    >
      <Icon className={`${iconSizes} shrink-0`} aria-hidden="true" />
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
}
