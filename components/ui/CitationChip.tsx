'use client';

import React from 'react';
import { FileSearch } from 'lucide-react';

interface CitationChipProps {
  clauseNumber?: string;
  pageNumber?: number;
  label?: string;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export function CitationChip({
  clauseNumber,
  pageNumber,
  label,
  onClick,
  className = '',
  id,
}: CitationChipProps) {
  const displayText =
    label ||
    [clauseNumber ? `Clause ${clauseNumber}` : '', pageNumber ? `page ${pageNumber}` : '']
      .filter(Boolean)
      .join(', ') ||
    'View in document';

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-soft text-primary hover:opacity-90 active:scale-95 transition-all border border-primary/20 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-focus-ring ${className}`}
      title="Tap to see original text in document"
    >
      <FileSearch className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{displayText}</span>
    </button>
  );
}
