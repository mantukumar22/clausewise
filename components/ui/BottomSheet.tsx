'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  id = 'mobile-bottom-sheet',
}: BottomSheetProps) {
  // Prevent background scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bottom-sheet-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative w-full h-[88vh] max-h-[90vh] bg-surface rounded-t-3xl border-t border-border shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-5 duration-200">
        {/* Drag Handle Indicator */}
        <div
          className="w-full pt-3 pb-1.5 flex justify-center shrink-0 cursor-pointer"
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-border" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 id="bottom-sheet-title" className="text-base font-bold text-text truncate">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center text-text-muted hover:text-text active:scale-95 transition cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label="Close bottom sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Body */}
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
