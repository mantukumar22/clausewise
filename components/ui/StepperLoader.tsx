'use client';

import React, { useState, useEffect } from 'react';
import { Check, Loader2, ShieldCheck, FileText, Search, Sparkles } from 'lucide-react';

interface StepperLoaderProps {
  fileName?: string;
  documentName?: string;
  jurisdictionState?: string;
  className?: string;
  id?: string;
}

const STAGES = [
  {
    id: 1,
    title: 'Reading your document',
    desc: 'Extracting clauses, names, amounts, and dates in memory',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Finding important clauses',
    desc: 'Checking for hidden lock-in penalties, auto-escalations, and unfair terms',
    icon: Search,
  },
  {
    id: 3,
    title: 'Checking the quotes are real',
    desc: 'Verifying every cited excerpt against the original text to prevent errors',
    icon: Sparkles,
  },
];

export function StepperLoader({
  fileName,
  documentName,
  jurisdictionState,
  className = '',
  id,
}: StepperLoaderProps) {
  const [activeStep, setActiveStep] = useState(1);
  const displayName = documentName || fileName;

  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(2), 2400);
    const t2 = setTimeout(() => setActiveStep(3), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      id={id}
      className={`p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-xs space-y-6 max-w-2xl mx-auto ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="text-center space-y-1.5">
        <h3 className="text-lg font-bold text-text">Reviewing your agreement</h3>
        <p className="text-xs sm:text-sm text-text-muted">
          {fileName
            ? `File: ${fileName}`
            : 'Analyzing your document with Indian legal knowledge pack...'}
        </p>
      </div>

      {/* Stepper Steps */}
      <div className="space-y-4 py-2">
        {STAGES.map((stage) => {
          const isDone = activeStep > stage.id;
          const isCurrent = activeStep === stage.id;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-primary-soft/40 border border-primary/30 ring-1 ring-primary/20'
                  : 'bg-surface-muted/60 border border-border/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-risk-low-fg text-white'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground animate-pulse'
                      : 'bg-surface text-text-muted border border-border'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-xs sm:text-sm font-semibold ${
                      isCurrent ? 'text-primary' : isDone ? 'text-text' : 'text-text-muted'
                    }`}
                  >
                    {stage.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold text-primary px-1.5 py-0.2 rounded bg-primary-soft">
                      In progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skeleton preview so the user sees a preview layout immediately */}
      <div className="p-4 rounded-xl border border-dashed border-border bg-surface-muted/30 space-y-2.5">
        <div className="h-3 w-1/3 bg-border/60 rounded animate-pulse" />
        <div className="h-3 w-full bg-border/40 rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-border/40 rounded animate-pulse" />
      </div>

      {/* Reassurance Line */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-1 border-t border-border">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span>Your document is processed in memory and not stored.</span>
      </div>
    </div>
  );
}
