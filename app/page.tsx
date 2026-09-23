'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  GitCompare,
  MessageSquare,
  FileCheck2,
  Calendar,
  Layers,
  UploadCloud,
  Camera,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileCode,
  ArrowRight,
  HelpCircle,
  Clock,
  Info,
  PenTool,
  Compass,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { DocumentViewer } from '@/components/DocumentViewer';
import { SummaryTab } from '@/components/tabs/SummaryTab';
import { ClausesTab } from '@/components/tabs/ClausesTab';
import { DatesChecklistTab } from '@/components/tabs/DatesChecklistTab';
import { CompareTab } from '@/components/tabs/CompareTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { LawyerBriefTab } from '@/components/tabs/LawyerBriefTab';
import { GuideMeTab } from '@/components/tabs/GuideMeTab';
import { DraftLetterTab } from '@/components/tabs/DraftLetterTab';
import { AboutGoogleModal } from '@/components/AboutGoogleModal';
import { SampleSelectorModal } from '@/components/SampleSelectorModal';
import { UploadModal } from '@/components/UploadModal';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { BottomTabBar, MainTabType } from '@/components/ui/BottomTabBar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { StepperLoader } from '@/components/ui/StepperLoader';
import { ClauseData } from '@/components/ui/ClauseCard';
import { AnalyzeResult } from '@/lib/schemas';
import { IndiaDocType } from '@/lib/india/knowledge';

export default function HomePage() {
  // Document state
  const [fileName, setFileName] = useState<string>('pune_rental_agreement.txt');
  const [documentText, setDocumentText] = useState<string>('');
  const [pages, setPages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isScanned, setIsScanned] = useState<boolean>(false);

  // Configuration state
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDocType, setSelectedDocType] = useState<IndiaDocType>('leave_and_license');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<MainTabType>('summary');

  // Active citation for highlighting & viewing
  const [activeCitation, setActiveCitation] = useState<{
    quote: string;
    pageNumber: number;
  } | null>(null);

  // Mobile Bottom Sheet viewer state
  const [mobileViewerOpen, setMobileViewerOpen] = useState<boolean>(false);

  // Pre-filled prompt when clicking "Ask about this clause"
  const [prefilledChatPrompt, setPrefilledChatPrompt] = useState<string | null>(null);

  // Modals state
  const [sampleModalOpen, setSampleModalOpen] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadModalMode, setUploadModalMode] = useState<'file' | 'camera' | 'paste'>('file');
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState<boolean>(false);
  const [aboutGoogleModalOpen, setAboutGoogleModalOpen] = useState<boolean>(false);
  const [draftLetterPreset, setDraftLetterPreset] = useState<{
    templateType:
      | 'deposit_refund'
      | 'clause_negotiation'
      | 'tenancy_termination_or_resignation'
      | 'consumer_complaint';
    issue?: string;
    amount?: string;
  } | null>(null);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Sync dark mode class on html tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Main analyze trigger
  const triggerAnalysis = useCallback(
    async (text: string, docType: IndiaDocType, state: string, lang: string, scanned: boolean) => {
      setIsAnalyzing(true);
      setAnalyzeError(null);
      setRejectionReason(null);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: text,
            documentType: docType,
            jurisdictionState: state,
            language: lang,
            isScanned: scanned,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Analysis service failed');
        }

        if (data.rejectionReason) {
          setRejectionReason(data.rejectionReason);
          setAnalysisResult(null);
        } else {
          setAnalysisResult(data);
          setActiveTab('summary');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error occurred during analysis';
        setAnalyzeError(errorMsg);
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  // Load sample document
  const loadSampleDocument = useCallback(
    async (sample: { name: string; filePath: string; docType: IndiaDocType; state: string }) => {
      setFileName(sample.name);
      setSelectedDocType(sample.docType);
      setSelectedState(sample.state);
      setIsScanned(false);

      try {
        const res = await fetch(sample.filePath);
        const text = await res.text();
        setDocumentText(text);

        // Simple page chunking
        const pageList = text.includes('--- Page')
          ? text.split(/--- Page \d+ ---/).filter((p) => p.trim().length > 0)
          : [text];

        setPages(pageList);
        setTotalPages(pageList.length);

        await triggerAnalysis(text, sample.docType, sample.state, selectedLanguage, false);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setAnalyzeError('Could not load sample file: ' + errorMsg);
      }
    },
    [selectedLanguage, triggerAnalysis]
  );

  // Initial load of Pune Rental Agreement sample on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSampleDocument({
        name: 'pune_rental_agreement.txt',
        filePath: '/samples/pune_rental_agreement.txt',
        docType: 'leave_and_license',
        state: 'Maharashtra',
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSampleDocument]);

  // Handle uploaded document
  const handleDocumentReady = (doc: {
    text: string;
    pages: string[];
    totalPages: number;
    isScanned: boolean;
    fileName: string;
  }) => {
    setFileName(doc.fileName);
    setDocumentText(doc.text);
    setPages(doc.pages);
    setTotalPages(doc.totalPages);
    setIsScanned(doc.isScanned);

    triggerAnalysis(doc.text, selectedDocType, selectedState, selectedLanguage, doc.isScanned);
  };

  // When a citation is tapped (e.g. from a clause card or chat answer)
  const handleSelectCitation = (quote: string, pageNumber: number) => {
    setActiveCitation({ quote, pageNumber });
    // On mobile (<1024px), open the full-height bottom sheet viewer
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileViewerOpen(true);
    }
  };

  // When "Ask about this clause" is clicked in a ClauseCard
  const handleAskAboutClause = (clause: ClauseData) => {
    setPrefilledChatPrompt(
      `Can you explain the clause "${clause.title}" in plain words? What are the risks and what should I ask the other party?`
    );
    setActiveTab('chat');
  };

  // Keyboard navigation (/ for chat focus, Esc to close sheets)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setActiveTab('chat');
      }
      if (e.key === 'Escape') {
        setMobileViewerOpen(false);
        setSampleModalOpen(false);
        setUploadModalOpen(false);
        setWhatsAppModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const highRiskCount = analysisResult?.clauses?.filter((c) => c.risk === 'high')?.length || 0;

  // Render the Document Viewer component
  const renderDocumentViewer = () => (
    <DocumentViewer
      fileName={fileName}
      pages={pages.length > 0 ? pages : [documentText || 'No document loaded.']}
      totalPages={totalPages}
      isScanned={isScanned}
      activeCitation={activeCitation}
      onClearActiveCitation={() => setActiveCitation(null)}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-text transition-colors antialiased">
      {/* 1. Header */}
      <Header
        selectedState={selectedState}
        onStateChange={(st) => {
          setSelectedState(st);
          if (documentText) {
            triggerAnalysis(documentText, selectedDocType, st, selectedLanguage, isScanned);
          }
        }}
        selectedDocType={selectedDocType}
        onDocTypeChange={(dt) => {
          setSelectedDocType(dt);
          if (documentText) {
            triggerAnalysis(documentText, dt, selectedState, selectedLanguage, isScanned);
          }
        }}
        selectedLanguage={selectedLanguage}
        onLanguageChange={(lang) => {
          setSelectedLanguage(lang);
          if (documentText) {
            triggerAnalysis(documentText, selectedDocType, selectedState, lang, isScanned);
          }
        }}
        onOpenSampleModal={() => setSampleModalOpen(true)}
        onOpenUploadModal={() => {
          setUploadModalMode('file');
          setUploadModalOpen(true);
        }}
        verificationReport={analysisResult?.verificationReport}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenAboutGoogle={() => setAboutGoogleModalOpen(true)}
      />

      {/* 2. Top Reassurance & Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 flex flex-col lg:flex-row gap-5">
        {/*
          DESKTOP LEFT COLUMN: Document Viewer (45% on desktop, hidden in flow on mobile)
          Mobile opens it as a BottomSheet on citation tap!
        */}
        <section
          id="left-pane-document-viewer"
          aria-label="Document Viewer"
          className="hidden lg:block lg:w-[44%] h-[calc(100vh-140px)] sticky top-20 shrink-0"
        >
          {renderDocumentViewer()}
        </section>

        {/*
          RIGHT COLUMN (or Full Width on Mobile): Analysis / Tabs / Landing
        */}
        <section
          id="right-pane-analysis-tabs"
          aria-label="Legal Analysis Workspace"
          className="w-full lg:w-[56%] flex flex-col min-h-[500px]"
        >
          {/* Desktop Tab Buttons (Hidden on mobile because mobile uses thumb-reachable BottomTabBar) */}
          {analysisResult && (
            <div
              id="desktop-tabs-navigation"
              className="hidden lg:flex items-center gap-1.5 p-1.5 bg-surface border border-border rounded-2xl mb-4 overflow-x-auto shrink-0 shadow-xs"
            >
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'summary'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Summary</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('clauses')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'clauses'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Clauses</span>
                {highRiskCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-risk-high-fg text-white text-[10px] flex items-center justify-center font-bold">
                    {highRiskCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dates')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'dates'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dates & Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'compare'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Versions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'chat'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Agreement</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('brief')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'brief'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Lawyer Brief</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'guide'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Guide Me</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('draft_letter')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  activeTab === 'draft_letter'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draft Letter</span>
              </button>
            </div>
          )}

          {/* Mobile Quick Doc Viewer Pill (Allows mobile user to view agreement at any time) */}
          <div className="lg:hidden flex items-center justify-between gap-2 mb-3 bg-surface p-2.5 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-text truncate max-w-[200px]">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileViewerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-soft text-primary border border-primary/20 hover:opacity-90 transition cursor-pointer min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Text</span>
            </button>
          </div>

          {/* Tab Content Area with Scroll */}
          <div className="flex-1 overflow-y-auto">
            {/* 1. Analyzing Stepper State */}
            {isAnalyzing && (
              <div id="analysis-loading-container" className="space-y-4">
                <StepperLoader documentName={fileName} jurisdictionState={selectedState} />
              </div>
            )}

            {/* 2. Non-Legal Document Rejection Banner */}
            {rejectionReason && !isAnalyzing && (
              <div
                id="non-legal-rejection-banner"
                className="p-6 rounded-2xl bg-risk-med-bg border border-risk-med-border space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-2 text-risk-med-fg">
                  <Info className="w-5 h-5 shrink-0" />
                  <h4 className="text-sm font-bold">Document Not Recognized as Legal Agreement</h4>
                </div>
                <p className="text-xs text-text leading-relaxed">{rejectionReason}</p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModalMode('file');
                      setUploadModalOpen(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px]"
                  >
                    Upload a Different File
                  </button>
                  <button
                    type="button"
                    onClick={() => setSampleModalOpen(true)}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer py-2"
                  >
                    Try a bundled sample contract
                  </button>
                </div>
              </div>
            )}

            {/* 3. Analysis Error Banner */}
            {analyzeError && !isAnalyzing && (
              <div
                id="analysis-error-banner"
                className="p-6 rounded-2xl bg-risk-high-bg border border-risk-high-border space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-2 text-risk-high-fg">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="text-sm font-bold">Analysis Could Not Complete</h4>
                </div>
                <p className="text-xs text-text">{analyzeError}</p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      triggerAnalysis(
                        documentText,
                        selectedDocType,
                        selectedState,
                        selectedLanguage,
                        isScanned
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-risk-high-fg text-white rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. HOME / LANDING VIEW (When activeTab === 'home' or document not loaded and not in guide/draft_letter/compare) */}
            {(!analysisResult || activeTab === 'home') &&
              !isAnalyzing &&
              activeTab !== 'guide' &&
              activeTab !== 'draft_letter' &&
              activeTab !== 'compare' && (
                <div id="home-landing-view" className="space-y-6 pb-12">
                  {/* Hero card */}
                  <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-5 shadow-xs">
                    <div className="space-y-2 max-w-xl">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        Contract Guidance For Everyone
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight leading-snug">
                        Understand your agreement before you sign it
                      </h1>
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                        Upload a rental agreement, job offer, or loan deed. We&apos;ll find hidden
                        traps, check standard legal rules, and explain everything in plain words.
                      </p>
                    </div>

                    {/* 3 Primary Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadModalMode('file');
                          setUploadModalOpen(true);
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-primary-foreground hover:opacity-95 active:scale-95 transition shadow-xs cursor-pointer min-h-[72px]"
                      >
                        <UploadCloud className="w-6 h-6" />
                        <span className="text-xs font-bold text-center">Upload PDF or Word</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadModalMode('camera');
                          setUploadModalOpen(true);
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-muted hover:bg-border text-text border border-border transition cursor-pointer min-h-[72px]"
                      >
                        <Camera className="w-6 h-6 text-primary" />
                        <span className="text-xs font-bold text-center">Take a Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadModalMode('paste');
                          setUploadModalOpen(true);
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-muted hover:bg-border text-text border border-border transition cursor-pointer min-h-[72px]"
                      >
                        <FileCode className="w-6 h-6 text-primary" />
                        <span className="text-xs font-bold text-center">Paste Agreement Text</span>
                      </button>
                    </div>

                    {/* Privacy reassurance note */}
                    <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                      <ShieldCheck className="w-4 h-4 text-risk-low-fg shrink-0" />
                      <span>
                        <strong>100% Private:</strong> Your document is processed in memory and
                        never stored.
                      </span>
                    </div>

                    {/* 4 Dedicated Entry Paths */}
                    <div className="pt-4 border-t border-border space-y-2">
                      <span className="text-xs font-bold text-text uppercase tracking-wider text-text-muted">
                        Explore By Action
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadModalMode('file');
                            setUploadModalOpen(true);
                          }}
                          className="flex flex-col items-start p-3 rounded-xl bg-surface-muted hover:bg-border border border-border text-left transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-primary mb-1.5" />
                          <span className="text-xs font-bold text-text">Understand</span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Analyze plain words & risks
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('compare')}
                          className="flex flex-col items-start p-3 rounded-xl bg-surface-muted hover:bg-border border border-border text-left transition cursor-pointer"
                        >
                          <GitCompare className="w-4 h-4 text-primary mb-1.5" />
                          <span className="text-xs font-bold text-text">Compare</span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Diff draft vs revised versions
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('guide')}
                          className="flex flex-col items-start p-3 rounded-xl bg-surface-muted hover:bg-border border border-border text-left transition cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-primary mb-1.5" />
                          <span className="text-xs font-bold text-text">Guide Me</span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Dispute wizard & legal rights
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('draft_letter')}
                          className="flex flex-col items-start p-3 rounded-xl bg-surface-muted hover:bg-border border border-border text-left transition cursor-pointer"
                        >
                          <PenTool className="w-4 h-4 text-primary mb-1.5" />
                          <span className="text-xs font-bold text-text">Draft Letter</span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Formal notice & refund letters
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Or try a bundled sample */}
                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">
                          Or test with sample agreements with real hidden traps:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSampleModalOpen(true)}
                          className="text-xs text-primary font-bold hover:underline cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            loadSampleDocument({
                              name: 'pune_rental_agreement.txt',
                              filePath: '/samples/pune_rental_agreement.txt',
                              docType: 'leave_and_license',
                              state: 'Maharashtra',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-primary-soft text-text hover:text-primary text-xs font-semibold border border-border transition cursor-pointer min-h-[38px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>Pune Flat Agreement (11-Month)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            loadSampleDocument({
                              name: 'tech_offer_letter.txt',
                              filePath: '/samples/tech_offer_letter.txt',
                              docType: 'employment_offer',
                              state: 'Karnataka',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-primary-soft text-text hover:text-primary text-xs font-semibold border border-border transition cursor-pointer min-h-[38px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>Bangalore Tech Job Offer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            loadSampleDocument({
                              name: 'personal_loan_agreement.txt',
                              filePath: '/samples/personal_loan_agreement.txt',
                              docType: 'loan_agreement',
                              state: 'Maharashtra',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-primary-soft text-text hover:text-primary text-xs font-semibold border border-border transition cursor-pointer min-h-[38px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>NBFC Personal Loan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3 Trust Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-surface rounded-2xl border border-border p-4 space-y-1 shadow-xs">
                      <ShieldCheck className="w-5 h-5 text-risk-low-fg mb-1" />
                      <h5 className="text-xs font-bold text-text">100% Private</h5>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Files are read in memory during your session. No documents are stored on
                        databases.
                      </p>
                    </div>

                    <div className="bg-surface rounded-2xl border border-border p-4 space-y-1 shadow-xs">
                      <FileText className="w-5 h-5 text-primary mb-1" />
                      <h5 className="text-xs font-bold text-text">Plain Words</h5>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Written at an 8th-grade level. Clear explanations without legal jargon.
                      </p>
                    </div>

                    <div className="bg-surface rounded-2xl border border-border p-4 space-y-1 shadow-xs">
                      <HelpCircle className="w-5 h-5 text-text-muted mb-1" />
                      <h5 className="text-xs font-bold text-text">Legal Information</h5>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Neutral guidance to empower you before signing. Not formal legal advice.
                      </p>
                    </div>
                  </div>

                  {/* 3-Step "How it works" strip */}
                  <div className="bg-surface rounded-2xl border border-border p-6 space-y-3 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      How ClauseWise Works
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <strong className="text-text block">Upload Agreement</strong>
                          <p className="text-text-muted text-[11px] mt-0.5">
                            PDF, photo, Word (.docx), or paste raw contract text.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <strong className="text-text block">We Spot Hidden Traps</strong>
                          <p className="text-text-muted text-[11px] mt-0.5">
                            Flags one-sided lock-ins, missing clauses, and calculates rent hikes.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div>
                          <strong className="text-text block">Ask & Negotiate</strong>
                          <p className="text-text-muted text-[11px] mt-0.5">
                            Get plain answers with exact page numbers and a lawyer brief.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* 5. ACTIVE TABS (When analysis is present and activeTab != 'home') */}
            {!isAnalyzing && analysisResult && activeTab !== 'home' && (
              <>
                {activeTab === 'summary' && (
                  <SummaryTab
                    analysis={analysisResult}
                    selectedState={selectedState}
                    onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
                  />
                )}

                {activeTab === 'clauses' && (
                  <ClausesTab
                    clauses={analysisResult.clauses}
                    missingProtections={analysisResult.missingProtections}
                    onSelectCitation={handleSelectCitation}
                    onAskClause={handleAskAboutClause}
                    isScanned={isScanned}
                  />
                )}

                {activeTab === 'dates' && (
                  <DatesChecklistTab
                    dates={analysisResult.keyDates}
                    checklist={analysisResult.actionChecklist}
                  />
                )}

                {activeTab === 'compare' && (
                  <CompareTab
                    currentDocumentText={documentText}
                    currentDocumentName={fileName}
                    selectedDocType={selectedDocType}
                    selectedState={selectedState}
                    selectedLanguage={selectedLanguage}
                  />
                )}

                {activeTab === 'chat' && (
                  <ChatTab
                    documentText={documentText}
                    selectedDocType={selectedDocType}
                    selectedState={selectedState}
                    selectedLanguage={selectedLanguage}
                    onSelectCitation={handleSelectCitation}
                    prefilledPrompt={prefilledChatPrompt}
                    onClearPrefilledPrompt={() => setPrefilledChatPrompt(null)}
                  />
                )}

                {activeTab === 'brief' && (
                  <LawyerBriefTab
                    analysis={analysisResult}
                    fileName={fileName}
                    selectedState={selectedState}
                    onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
                  />
                )}

                {activeTab === 'guide' && (
                  <GuideMeTab
                    onGoToDraftLetter={(preset) => {
                      setDraftLetterPreset(preset);
                      setActiveTab('draft_letter');
                    }}
                  />
                )}

                {activeTab === 'draft_letter' && (
                  <DraftLetterTab analysis={analysisResult} initialPreset={draftLetterPreset} />
                )}
              </>
            )}

            {/* Standalone Guide Me & Draft Letter tabs (accessible even before uploading a document) */}
            {!isAnalyzing && !analysisResult && activeTab === 'guide' && (
              <GuideMeTab
                onGoToDraftLetter={(preset) => {
                  setDraftLetterPreset(preset);
                  setActiveTab('draft_letter');
                }}
              />
            )}

            {!isAnalyzing && !analysisResult && activeTab === 'draft_letter' && (
              <DraftLetterTab analysis={analysisResult} initialPreset={draftLetterPreset} />
            )}

            {!isAnalyzing && !analysisResult && activeTab === 'compare' && (
              <CompareTab
                currentDocumentText={documentText}
                currentDocumentName={fileName}
                selectedDocType={selectedDocType}
                selectedState={selectedState}
                selectedLanguage={selectedLanguage}
              />
            )}
          </div>
        </section>
      </main>

      {/* 4. Mobile Bottom Tab Bar (Thumb-reachable, fixed bottom) */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        highRiskCount={highRiskCount}
        hasDocument={!!analysisResult}
        onOpenHelp={() => setActiveTab('brief')}
      />

      {/* 5. Mobile Full-Height Bottom Sheet Document Viewer (Triggered on citation tap) */}
      <BottomSheet
        isOpen={mobileViewerOpen}
        onClose={() => setMobileViewerOpen(false)}
        title={fileName}
        subtitle="Original Document Text"
      >
        <div className="h-[75vh]">{renderDocumentViewer()}</div>
      </BottomSheet>

      {/* 6. Sample Selector Modal */}
      <SampleSelectorModal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        onSelectSample={(s) => {
          setSampleModalOpen(false);
          loadSampleDocument(s);
        }}
      />

      {/* 7. Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onDocumentReady={handleDocumentReady}
        initialMode={uploadModalMode}
      />

      {/* 8. WhatsApp Sharing Modal */}
      {analysisResult && (
        <WhatsAppModal
          isOpen={whatsAppModalOpen}
          onClose={() => setWhatsAppModalOpen(false)}
          analysis={analysisResult}
          fileName={fileName}
          selectedState={selectedState}
        />
      )}

      {/* 9. About Google Services Transparency Modal */}
      <AboutGoogleModal
        isOpen={aboutGoogleModalOpen}
        onClose={() => setAboutGoogleModalOpen(false)}
      />
    </div>
  );
}
