'use client';

import React, { useState } from 'react';
import { MessageSquareShare, X, Copy, Check, ExternalLink } from 'lucide-react';
import { AnalyzeResult } from '@/lib/schemas';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalyzeResult;
  fileName: string;
  selectedState: string;
}

export function WhatsAppModal({
  isOpen,
  onClose,
  analysis,
  fileName,
  selectedState,
}: WhatsAppModalProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const { clauses, rentalMathExtracted } = analysis;
  const highRisk = clauses.filter((c) => c.risk === 'high');

  // Build compact WhatsApp text (< 1000 characters)
  const buildWhatsAppText = () => {
    let text = `📄 *ClauseWise Quick Summary*\n`;
    text += `*Doc:* ${fileName.slice(0, 30)} (${selectedState})\n\n`;

    // Core numbers
    if (rentalMathExtracted?.monthlyRent) {
      text += `💰 *Key Numbers:*\n`;
      text += `• Rent: ₹${rentalMathExtracted.monthlyRent.toLocaleString('en-IN')}/mo\n`;
      if (rentalMathExtracted.securityDeposit) {
        text += `• Deposit: ₹${rentalMathExtracted.securityDeposit.toLocaleString('en-IN')}\n`;
      }
      if (rentalMathExtracted.escalationPercent) {
        text += `• Escalation: ${rentalMathExtracted.escalationPercent}%/year\n`;
      }
      text += `\n`;
    }

    // High risks
    if (highRisk.length > 0) {
      text += `⚠️ *Watch Out (${highRisk.length} High Risks):*\n`;
      highRisk.slice(0, 3).forEach((c) => {
        text += `• *${c.title}*: ${c.whyItMatters.slice(0, 80)}...\n`;
      });
      text += `\n`;
    }

    // Questions to ask
    const topQuestions = analysis.lawyerBrief?.prioritizedQuestions || [];
    if (topQuestions.length > 0) {
      text += `❓ *Questions to Ask:*\n`;
      topQuestions.slice(0, 2).forEach((q, idx) => {
        text += `${idx + 1}. ${q.slice(0, 80)}\n`;
      });
      text += `\n`;
    }

    text += `_Legal information only, not legal advice._`;

    if (text.length > 980) {
      text = text.slice(0, 975) + '...';
    }

    return text;
  };

  const whatsAppText = buildWhatsAppText();

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="whatsapp-export-modal"
        className="bg-surface rounded-2xl border border-border shadow-xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-risk-low-bg text-risk-low-fg border border-risk-low-border flex items-center justify-center shrink-0">
              <MessageSquareShare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">Share on WhatsApp</h3>
              <p className="text-xs text-text-muted">
                Compact plain-text message under 1,000 characters.
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

        {/* Character Count */}
        <div className="flex items-center justify-between text-xs text-text-muted bg-surface-muted px-3 py-1.5 rounded-xl border border-border">
          <span>
            Length: <strong className="text-text">{whatsAppText.length}</strong> / 1000
          </span>
          <span className="text-risk-low-fg font-semibold">Single message size</span>
        </div>

        {/* Preview Container */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border">
          <div className="bg-surface rounded-xl p-3 text-xs text-text shadow-xs whitespace-pre-wrap font-sans leading-relaxed border border-border/50">
            {whatsAppText}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-muted text-text transition cursor-pointer min-h-[44px]"
          >
            {copied ? <Check className="w-4 h-4 text-risk-low-fg" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-risk-low-bg text-risk-low-fg border border-risk-low-border hover:opacity-90 shadow-xs transition cursor-pointer min-h-[44px]"
          >
            <MessageSquareShare className="w-4 h-4" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
}
