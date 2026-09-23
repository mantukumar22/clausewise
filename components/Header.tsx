'use client';

import React from 'react';
import { Scale, FileText, MapPin, Sparkles, Moon, Sun, ShieldCheck, Upload } from 'lucide-react';
import { INDIAN_STATES_AND_UTS, DOCUMENT_TYPES } from '@/lib/india/states';
import { IndiaDocType } from '@/lib/india/knowledge';
import { CitationReport } from '@/lib/verify';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface HeaderProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedDocType: IndiaDocType;
  onDocTypeChange: (docType: IndiaDocType) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenSampleModal: () => void;
  onOpenUploadModal: () => void;
  verificationReport?: CitationReport | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAboutGoogle?: () => void;
}

export function Header({
  selectedState,
  onStateChange,
  selectedDocType,
  onDocTypeChange,
  selectedLanguage,
  onLanguageChange,
  onOpenSampleModal,
  onOpenUploadModal,
  verificationReport,
  darkMode,
  onToggleDarkMode,
  onOpenAboutGoogle,
}: HeaderProps) {
  return (
    <header
      id="clausewise-header"
      className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border transition-colors select-none"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-text truncate">
                  ClauseWise
                </span>
                <span className="hidden xs:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20 shrink-0">
                  India
                </span>
              </div>
              <p className="text-xs text-text-muted hidden md:block">
                Clear contract guide for non-lawyers
              </p>
            </div>
          </div>

          {/* Right Controls Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Jurisdiction State Selector */}
            <div className="hidden lg:flex items-center gap-1 bg-surface-muted rounded-xl px-2.5 py-1 text-xs border border-border">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <select
                id="header-state-selector"
                value={selectedState}
                onChange={(e) => onStateChange(e.target.value)}
                className="bg-transparent text-text font-medium focus:outline-hidden cursor-pointer pr-1"
                title="Indian State or Union Territory jurisdiction"
              >
                {INDIAN_STATES_AND_UTS.map((s) => (
                  <option key={s.code} value={s.name} className="bg-surface text-text">
                    {s.name} {s.isUT ? '(UT)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type Selector */}
            <div className="hidden xl:flex items-center gap-1 bg-surface-muted rounded-xl px-2.5 py-1 text-xs border border-border">
              <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <select
                id="header-doctype-selector"
                value={selectedDocType}
                onChange={(e) => onDocTypeChange(e.target.value as IndiaDocType)}
                className="bg-transparent text-text font-medium focus:outline-hidden cursor-pointer pr-1"
                title="Agreement category"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.id} value={dt.id} className="bg-surface text-text">
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <LanguageSelector selectedCode={selectedLanguage} onSelect={onLanguageChange} />

            {/* Citation Verification Pill (if available) */}
            {verificationReport && (
              <div
                id="header-citation-report"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-risk-low-bg text-risk-low-fg border border-risk-low-border"
                title={`${verificationReport.verifiedCount} of ${verificationReport.totalCitations} extracted quotes matched in source document`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">
                  {verificationReport.verifiedCount}/{verificationReport.totalCitations} verified
                </span>
              </div>
            )}

            {/* Try Sample Button */}
            <button
              type="button"
              id="header-sample-button"
              onClick={onOpenSampleModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface-muted hover:bg-border text-text border border-border transition min-h-[40px] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Sample</span>
            </button>

            {/* Upload Button */}
            <button
              type="button"
              id="header-upload-button"
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition shadow-xs min-h-[40px] cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Upload</span>
            </button>

            {/* About Google Services */}
            {onOpenAboutGoogle && (
              <button
                type="button"
                id="header-about-google-button"
                onClick={onOpenAboutGoogle}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-surface-muted hover:bg-border text-text border border-border transition min-h-[40px] cursor-pointer"
                title="About Google services and data privacy"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>About</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              id="header-dark-mode-toggle"
              onClick={onToggleDarkMode}
              className="w-10 h-10 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted border border-border flex items-center justify-center transition cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
