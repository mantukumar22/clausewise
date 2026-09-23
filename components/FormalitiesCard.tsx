'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCheck,
  Calendar,
  PenTool,
  Users,
  Award,
  CreditCard,
  Stamp,
  ShieldCheck,
} from 'lucide-react';
import { FormalitiesCheck } from '@/lib/schemas';

interface FormalitiesCardProps {
  formalities: FormalitiesCheck;
}

export function FormalitiesCard({ formalities }: FormalitiesCardProps) {
  const items = [
    {
      key: 'stampDutyOrEStamp',
      label: 'Stamp Paper / E-Stamp',
      icon: Stamp,
      data: formalities?.stampDutyOrEStamp,
    },
    {
      key: 'registration',
      label: 'Registration with Sub-Registrar',
      icon: FileCheck,
      data: formalities?.registration,
    },
    {
      key: 'witnesses',
      label: 'Two Attesting Witnesses',
      icon: Users,
      data: formalities?.witnesses,
    },
    {
      key: 'notarization',
      label: 'Notarization / Seal',
      icon: Award,
      data: formalities?.notarization,
    },
    {
      key: 'signaturesOfAllParties',
      label: 'Signatures of All Parties',
      icon: PenTool,
      data: formalities?.signaturesOfAllParties,
    },
    {
      key: 'panAadhaarReferences',
      label: 'Identity / PAN References',
      icon: CreditCard,
      data: formalities?.panAadhaarReferences,
    },
    {
      key: 'datedExecution',
      label: 'Execution Date Stated',
      icon: Calendar,
      data: formalities?.datedExecution,
    },
  ];

  const getStatusBadge = (status: 'found' | 'not_found' | 'unclear') => {
    switch (status) {
      case 'found':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-risk-low-fg bg-risk-low-bg px-2.5 py-0.5 rounded-full border border-risk-low-border">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Found
          </span>
        );
      case 'not_found':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-risk-high-fg bg-risk-high-bg px-2.5 py-0.5 rounded-full border border-risk-high-border">
            <XCircle className="w-3.5 h-3.5" />
            Not found
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted bg-surface-muted px-2.5 py-0.5 rounded-full border border-border">
            <HelpCircle className="w-3.5 h-3.5" />
            Unclear
          </span>
        );
    }
  };

  return (
    <div
      id="formalities-check-card"
      className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <h3 className="text-base font-bold text-text">
              Formalities & Enforceability Checklist
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Checks standard legal requirements under Indian law (stamp duty, witness attestation,
            and compulsory registration).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const status = item.data?.status || 'unclear';
          const details = item.data?.details || '';
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="p-3.5 rounded-xl border border-border bg-surface-muted/50 hover:bg-surface-muted transition flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-text truncate">{item.label}</span>
                </div>
                {getStatusBadge(status)}
              </div>

              {details && (
                <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                  {details}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
