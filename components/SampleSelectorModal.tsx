'use client';

import React from 'react';
import { X, Sparkles, Home, Briefcase, CreditCard, Building2, ArrowRight } from 'lucide-react';
import { IndiaDocType } from '@/lib/india/knowledge';

interface SampleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: {
    name: string;
    filePath: string;
    docType: IndiaDocType;
    state: string;
  }) => void;
}

export function SampleSelectorModal({ isOpen, onClose, onSelectSample }: SampleSelectorModalProps) {
  if (!isOpen) return null;

  const samples = [
    {
      id: 'pune-lease',
      name: 'Pune 11-Month Rental Agreement',
      subtitle: 'Residential Flat in Koregaon Park, Pune',
      docType: 'leave_and_license' as IndiaDocType,
      state: 'Maharashtra',
      icon: Home,
      filePath: '/samples/pune_rental_agreement.txt',
      badge: 'Primary Sample',
      highlights: [
        'Hidden 10% rent hike',
        'Strict 6-month lock-in & penalty',
        'Owner visit anytime without notice',
        'One-sided sole arbitrator',
      ],
    },
    {
      id: 'pune-lease-v2',
      name: 'Pune Rental Agreement (V2 Renewal Proposal)',
      subtitle: 'Counterparty Revised Draft for Compare Mode',
      docType: 'leave_and_license' as IndiaDocType,
      state: 'Maharashtra',
      icon: Home,
      filePath: '/samples/pune_rental_agreement_v2_revised.txt',
      badge: 'Comparison Draft',
      highlights: [
        'Escalation adjusted down to 5%',
        'Deposit return deadline added',
        'Automatic renewal clause inserted',
      ],
    },
    {
      id: 'bangalore-offer',
      name: 'Bangalore Tech Employment Offer',
      subtitle: 'ApexByte Innovations • Senior Software Engineer',
      docType: 'employment_offer' as IndiaDocType,
      state: 'Karnataka',
      icon: Briefcase,
      filePath: '/samples/tech_offer_letter.txt',
      badge: 'Job Offer',
      highlights: [
        '₹2,00,000 training bond for 12 months',
        '90-day notice with company waiver discretion',
        '24-month nationwide non-compete',
      ],
    },
    {
      id: 'mumbai-loan',
      name: 'Mumbai NBFC Personal Loan Agreement',
      subtitle: 'QuickRupee Finserve NBFC • ₹3,00,000 Loan',
      docType: 'loan_agreement' as IndiaDocType,
      state: 'Maharashtra',
      icon: CreditCard,
      filePath: '/samples/personal_loan_agreement.txt',
      badge: 'Loan Deed',
      highlights: [
        'Key Fact Statement (KFS) omitted',
        '5% prepayment foreclosure fee',
        'Compounding 36% penal overdue rate',
      ],
    },
    {
      id: 'commercial-nda',
      name: 'Commercial NDA & Vendor Services',
      subtitle: 'CloudMatrix LLP & Zenith Tech Systems',
      docType: 'general_agreement' as IndiaDocType,
      state: 'Delhi NCR',
      icon: Building2,
      filePath: '/samples/commercial_nda_vendor.txt',
      badge: 'Vendor Contract',
      highlights: [
        'Unilateral right to change milestones',
        'Unlimited client indemnity',
        'Distant jurisdiction in Guwahati',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="sample-selector-modal"
        className="bg-surface rounded-2xl border border-border shadow-xl max-w-2xl w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">Choose a Sample Agreement</h3>
              <p className="text-xs text-text-muted">
                Pre-loaded contracts with real-world clauses to see ClauseWise in action.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-muted transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {samples.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSample(s)}
                className="group p-4 rounded-2xl border border-border hover:border-primary bg-surface hover:bg-primary-soft/20 cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs min-h-[44px]"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-surface-muted text-text-muted group-hover:bg-primary group-hover:text-primary-foreground transition shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-text group-hover:text-primary transition">
                        {s.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border">
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {s.subtitle} &bull; {s.state}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-text-muted">
                      {s.highlights.map((h, idx) => (
                        <span
                          key={idx}
                          className="bg-surface-muted px-2 py-0.5 rounded-md border border-border"
                        >
                          ⚠️ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition">
                    <span>Try this</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
