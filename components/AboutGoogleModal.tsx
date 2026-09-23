'use client';

import React from 'react';
import { X, ShieldCheck, Cpu, Globe, Volume2, Type } from 'lucide-react';

interface AboutGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutGoogleModal({ isOpen, onClose }: AboutGoogleModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-google-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-sm">
              G
            </div>
            <div>
              <h2 id="about-google-title" className="text-sm font-bold text-text">
                Powered by Google Technologies
              </h2>
              <p className="text-[11px] text-text-muted">
                Transparent disclosure of Google services & data privacy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-muted transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-text leading-relaxed">
          <div className="p-3 rounded-xl bg-surface-muted border border-border space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-text">
              <Cpu className="w-4 h-4 text-primary shrink-0" />
              <span>Gemini 3.8 Flash & Google GenAI SDK</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Used for structured contract analysis, clause extraction, risk assessment,
              plain-language translation, and verified citation matching. Document text is passed in
              memory via HTTPS and is not retained or used for foundation model training.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted border border-border space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-text">
              <Type className="w-4 h-4 text-primary shrink-0" />
              <span>Google Fonts (Inter & Indian Scripts)</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Loaded securely via Next.js built-in font optimization (`next/font/google`) without
              external tracking or third-party cookies.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted border border-border space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-text">
              <Volume2 className="w-4 h-4 text-primary shrink-0" />
              <span>Web Speech & Gemini TTS Integration</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Powers the audio read-aloud functionality for summaries and key clauses, supporting
              accessible navigation for first-time signers and non-native speakers.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-risk-low-bg border border-risk-low-border text-risk-low-fg space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero Document Storage Guarantee</span>
            </div>
            <p className="text-[11px] opacity-90">
              ClauseWise never stores documents in databases, disks, or tracking cookies. All
              contract analysis resides strictly in your browser session memory.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-95 transition cursor-pointer min-h-[38px]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
