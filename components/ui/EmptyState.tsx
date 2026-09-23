'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  dashed?: boolean;
  className?: string;
  id?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
  dashed = false,
  className = '',
  id,
}: EmptyStateProps) {
  return (
    <div
      id={id}
      className={`p-8 text-center rounded-2xl ${
        dashed ? 'border-2 border-dashed border-border' : 'border border-border'
      } bg-surface space-y-3 transition-colors ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-surface-muted text-text-muted flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h4 className="text-sm sm:text-base font-bold text-text">{title}</h4>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition cursor-pointer min-h-[44px]"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
