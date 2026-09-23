'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  scriptSubset?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', scriptSubset: 'devanagari' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', scriptSubset: 'devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

interface LanguageSelectorProps {
  selectedCode: string;
  onSelect: (code: string) => void;
  className?: string;
  id?: string;
}

export function LanguageSelector({
  selectedCode,
  onSelect,
  className = '',
  id = 'language-selector-button',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-text hover:bg-surface-muted transition text-xs font-semibold cursor-pointer min-h-[40px] shadow-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current: ${currentLang.nativeName}`}
      >
        <Globe className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <span className="font-medium">{currentLang.nativeName}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 mt-1.5 w-48 rounded-2xl border border-border bg-surface shadow-xl p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === selectedCode;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-primary-soft text-primary font-bold'
                    : 'text-text hover:bg-surface-muted'
                }`}
              >
                <div>
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-[11px] text-text-muted ml-1.5">({lang.name})</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
