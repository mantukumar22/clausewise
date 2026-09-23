'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2, Info } from 'lucide-react';
import { ChatResult } from '@/lib/schemas';
import { IndiaDocType } from '@/lib/india/knowledge';
import { CitationChip } from '@/components/ui/CitationChip';

interface ChatTabProps {
  documentText: string;
  selectedDocType: IndiaDocType;
  selectedState: string;
  selectedLanguage: string;
  onSelectCitation: (quote: string, pageNumber: number) => void;
  prefilledPrompt?: string | null;
  onClearPrefilledPrompt?: () => void;
}

export function ChatTab({
  documentText,
  selectedDocType,
  selectedState,
  selectedLanguage,
  onSelectCitation,
  prefilledPrompt,
  onClearPrefilledPrompt,
}: ChatTabProps) {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      citations?: ChatResult['citations'];
      isFoundInDocument?: boolean;
      relatedTopics?: string[];
    }>
  >([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! Ask me anything about your agreement. I'll explain things in plain words and show you the exact clause and page number.",
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messageCounterRef = useRef<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-fill prompt if user clicked "Ask about this clause"
  useEffect(() => {
    if (prefilledPrompt) {
      const timer = setTimeout(() => {
        setInputQuery(prefilledPrompt);
        inputRef.current?.focus();
        onClearPrefilledPrompt?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [prefilledPrompt, onClearPrefilledPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested plain-language prompt chips
  const suggestedQueries = [
    'Can I leave early?',
    'How much deposit do I get back?',
    'When can rent increase?',
    'Who pays for damages and repairs?',
    'Can the owner visit anytime?',
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    setChatError(null);

    const userMsgId = `user-msg-${messageCounterRef.current++}`;
    const newMessages = [...messages, { id: userMsgId, role: 'user' as const, content: q }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          messages: historyPayload,
          documentType: selectedDocType,
          jurisdictionState: selectedState,
          language: selectedLanguage,
        }),
      });

      const data: ChatResult & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Could not get an answer right now');
      }

      const botMsgId = `asst-msg-${messageCounterRef.current++}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          role: 'assistant',
          content: data.answer,
          citations: data.citations,
          isFoundInDocument: data.isFoundInDocument,
          relatedTopics: data.relatedTopics,
        },
      ]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error answering question';
      setChatError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="chat-tab-content"
      className="flex flex-col h-[calc(100vh-230px)] min-h-[500px] bg-surface rounded-2xl border border-border shadow-xs overflow-hidden transition-colors"
    >
      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 sm:gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-muted text-primary border border-border'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-xs'
                  : 'bg-surface-muted text-text border border-border rounded-tl-xs'
              }`}
            >
              {/* Not covered in document: neutral info style, NEVER an error style */}
              {m.isFoundInDocument === false && (
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted bg-surface px-2.5 py-1 rounded-lg border border-border">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Not covered in your document</span>
                </div>
              )}

              <p className="whitespace-pre-wrap">{m.content}</p>

              {/* Citations as Tappable Chips */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-border space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                    Verified Excerpts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {m.citations.map((cit, idx) => (
                      <CitationChip
                        key={idx}
                        pageNumber={cit.pageNumber}
                        label={`Page ${cit.pageNumber} ("${cit.quote.slice(0, 24)}...")`}
                        onClick={() => onSelectCitation(cit.quote, cit.pageNumber)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Related topics chips if suggested */}
              {m.relatedTopics && m.relatedTopics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-text-muted">Follow-up:</span>
                  {m.relatedTopics.map((topic, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(topic)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface hover:bg-primary-soft text-text border border-border transition cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-muted text-primary border border-border flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-surface-muted border border-border text-xs text-text-muted flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Looking through the agreement text...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Area: Suggested Chips + Input Field */}
      <div className="border-t border-border bg-surface p-3 sm:p-4 space-y-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0))]">
        {/* Suggested Queries Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-surface-muted hover:bg-primary-soft text-text hover:text-primary border border-border text-xs whitespace-nowrap transition cursor-pointer shrink-0 min-h-[36px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about your agreement (Press / to focus)..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-surface-muted border border-border text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-focus-ring min-h-[44px]"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 active:scale-95 disabled:opacity-40 transition cursor-pointer shrink-0 shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {chatError && (
          <p className="text-xs text-risk-high-fg flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{chatError}</span>
          </p>
        )}
      </div>
    </div>
  );
}
