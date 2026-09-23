'use client';

import React, { useState } from 'react';
import {
  Home,
  FileText,
  Layers,
  MessageSquare,
  MoreHorizontal,
  GitCompare,
  CalendarCheck,
  Briefcase,
  HelpCircle,
  X,
  PenTool,
  LifeBuoy,
} from 'lucide-react';

export type MainTabType =
  | 'home'
  | 'summary'
  | 'clauses'
  | 'compare'
  | 'dates'
  | 'chat'
  | 'brief'
  | 'guide'
  | 'draft_letter';

interface BottomTabBarProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  onOpenHelp?: () => void;
  highRiskCount?: number;
  hasDocument: boolean;
  className?: string;
  id?: string;
}

export function BottomTabBar({
  activeTab,
  onSelectTab,
  onOpenHelp,
  highRiskCount = 0,
  hasDocument,
  className = '',
  id = 'mobile-bottom-nav-bar',
}: BottomTabBarProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleTabClick = (tab: MainTabType) => {
    setMoreMenuOpen(false);
    onSelectTab(tab);
  };

  const isMoreTabActive = ['compare', 'dates', 'brief', 'guide', 'draft_letter'].includes(
    activeTab
  );

  return (
    <>
      {/* "More" Drawer Popup for secondary tabs */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMoreMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface rounded-t-2xl border-t border-border p-4 shadow-xl z-10 space-y-2 mb-16 animate-in slide-in-from-bottom-3 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Additional Tools
              </span>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-muted cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleTabClick('guide')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition cursor-pointer min-h-[44px] ${
                activeTab === 'guide'
                  ? 'bg-primary-soft text-primary font-semibold'
                  : 'text-text hover:bg-surface-muted'
              }`}
            >
              <LifeBuoy className="w-5 h-5 text-primary" />
              <div>
                <p>Guide Me (No Document)</p>
                <p className="text-xs text-text-muted">
                  Facing an issue? Get options, forums & next steps
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('draft_letter')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition cursor-pointer min-h-[44px] ${
                activeTab === 'draft_letter'
                  ? 'bg-primary-soft text-primary font-semibold'
                  : 'text-text hover:bg-surface-muted'
              }`}
            >
              <PenTool className="w-5 h-5 text-primary" />
              <div>
                <p>Draft a Letter</p>
                <p className="text-xs text-text-muted">
                  Deposit refund, negotiation, notice, or complaint
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('compare')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition cursor-pointer min-h-[44px] ${
                activeTab === 'compare'
                  ? 'bg-primary-soft text-primary font-semibold'
                  : 'text-text hover:bg-surface-muted'
              }`}
            >
              <GitCompare className="w-5 h-5 text-primary" />
              <div>
                <p>Compare Versions</p>
                <p className="text-xs text-text-muted">See what was changed, added, or removed</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('dates')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition cursor-pointer min-h-[44px] ${
                activeTab === 'dates'
                  ? 'bg-primary-soft text-primary font-semibold'
                  : 'text-text hover:bg-surface-muted'
              }`}
            >
              <CalendarCheck className="w-5 h-5 text-primary" />
              <div>
                <p>Dates & Checklist</p>
                <p className="text-xs text-text-muted">
                  Deadlines, notice periods & calendar events
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('brief')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition cursor-pointer min-h-[44px] ${
                activeTab === 'brief'
                  ? 'bg-primary-soft text-primary font-semibold'
                  : 'text-text hover:bg-surface-muted'
              }`}
            >
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <p>Lawyer Briefing Sheet</p>
                <p className="text-xs text-text-muted">
                  Printable summary with questions for counsel
                </p>
              </div>
            </button>

            {onOpenHelp && (
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  onOpenHelp();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium text-text hover:bg-surface-muted transition cursor-pointer min-h-[44px]"
              >
                <HelpCircle className="w-5 h-5 text-text-muted" />
                <div>
                  <p>Helplines & Legal Aid</p>
                  <p className="text-xs text-text-muted">
                    Free Indian legal helplines & consumer forums
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Tab Bar */}
      <nav
        id={id}
        aria-label="Mobile Navigation"
        className={`fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg select-none pb-[calc(0.375rem+env(safe-area-inset-bottom,0))] ${className}`}
      >
        {/* 1. Home / Upload */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'home' ? 'text-primary font-bold' : 'text-text-muted hover:text-text'
          }`}
          aria-label="Home and Upload"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* 2. Summary */}
        <button
          type="button"
          onClick={() => handleTabClick('summary')}
          disabled={!hasDocument}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition cursor-pointer ${
            !hasDocument ? 'opacity-40 cursor-not-allowed' : ''
          } ${
            activeTab === 'summary' ? 'text-primary font-bold' : 'text-text-muted hover:text-text'
          }`}
          aria-label="Agreement Summary"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Summary</span>
        </button>

        {/* 3. Clauses */}
        <button
          type="button"
          onClick={() => handleTabClick('clauses')}
          disabled={!hasDocument}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition cursor-pointer ${
            !hasDocument ? 'opacity-40 cursor-not-allowed' : ''
          } ${
            activeTab === 'clauses' ? 'text-primary font-bold' : 'text-text-muted hover:text-text'
          }`}
          aria-label="Clauses List"
        >
          <div className="relative">
            <Layers className="w-5 h-5" />
            {highRiskCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-risk-high-fg text-white text-[9px] font-bold flex items-center justify-center">
                {highRiskCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Clauses</span>
        </button>

        {/* 4. Ask */}
        <button
          type="button"
          onClick={() => handleTabClick('chat')}
          disabled={!hasDocument}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition cursor-pointer ${
            !hasDocument ? 'opacity-40 cursor-not-allowed' : ''
          } ${activeTab === 'chat' ? 'text-primary font-bold' : 'text-text-muted hover:text-text'}`}
          aria-label="Ask questions"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Ask</span>
        </button>

        {/* 5. More */}
        <button
          type="button"
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition cursor-pointer ${
            isMoreTabActive || moreMenuOpen
              ? 'text-primary font-bold'
              : 'text-text-muted hover:text-text'
          }`}
          aria-label="More tools"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
}
