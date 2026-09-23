'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, Download, Check, Copy, CalendarPlus } from 'lucide-react';
import { KeyDateItem, ChecklistItem } from '@/lib/schemas';

interface DatesChecklistTabProps {
  dates: KeyDateItem[];
  checklist: ChecklistItem[];
}

export function DatesChecklistTab({ dates, checklist }: DatesChecklistTabProps) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [copiedChecklist, setCopiedChecklist] = useState<boolean>(false);

  const toggleCheck = (id: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const beforeSigning = checklist.filter((item) => item.phase === 'before_signing');
  const duringTerm = checklist.filter((item) => item.phase === 'during_term');
  const atTermination = checklist.filter((item) => item.phase === 'at_termination');

  const completedCount = checklist.filter((item) => completedMap[item.id]).length;
  const progressPercent =
    checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleCopyChecklist = () => {
    const lines = [
      '# ClauseWise Action Checklist',
      `Progress: ${completedCount}/${checklist.length} completed\n`,
      '## Before Signing',
      ...beforeSigning.map(
        (i) =>
          `[${completedMap[i.id] ? 'X' : ' '}] ${i.task || i.item} (${i.criticality.toUpperCase()})\n    Note: ${i.details}`
      ),
      '\n## During Term',
      ...duringTerm.map(
        (i) =>
          `[${completedMap[i.id] ? 'X' : ' '}] ${i.task || i.item} (${i.criticality.toUpperCase()})\n    Note: ${i.details}`
      ),
      '\n## At Termination',
      ...atTermination.map(
        (i) =>
          `[${completedMap[i.id] ? 'X' : ' '}] ${i.task || i.item} (${i.criticality.toUpperCase()})\n    Note: ${i.details}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2000);
  };

  // Helper to generate .ics file for calendar
  const downloadIcs = (eventTitle: string, details: string) => {
    const now = new Date();
    const eventDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead default
    const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ClauseWise//Legal Deadline//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Agreement Deadline: ${eventTitle}`,
      `DESCRIPTION:${details.replace(/\n/g, ' ')}`,
      `DTSTART:${dateStr}`,
      `DTEND:${dateStr}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventTitle.slice(0, 20).replace(/\s+/g, '_')}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCriticalityBadge = (crit: 'must_do' | 'recommended' | 'optional') => {
    switch (crit) {
      case 'must_do':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-risk-high-bg text-risk-high-fg border border-risk-high-border">
            Must-Do
          </span>
        );
      case 'recommended':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-risk-med-bg text-risk-med-fg border border-risk-med-border">
            Recommended
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border">
            Optional
          </span>
        );
    }
  };

  return (
    <div id="dates-checklist-tab-content" className="space-y-6 pb-12">
      {/* 1. Key Dates & Deadlines Timeline */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <h3 className="text-base font-bold text-text">Key Dates & Deadlines</h3>
        </div>
        <p className="text-xs text-text-muted">
          All milestones, notice periods, and recurring deadlines extracted from the document with
          what happens if missed.
        </p>

        {dates.length === 0 ? (
          <p className="text-xs text-text-muted italic py-3">
            No specific calendar dates or deadlines were detected.
          </p>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {dates.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 sm:p-4 hover:bg-surface-muted/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text text-xs sm:text-sm">{d.event}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary-soft text-primary border border-primary/20">
                        {d.dateOrTimeline || d.dateOrPeriod}
                      </span>
                    </div>
                    {d.consequenceIfMissed && (
                      <p className="text-xs text-text-muted leading-relaxed">
                        <strong className="text-text">If missed:</strong> {d.consequenceIfMissed}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadIcs(d.event, d.consequenceIfMissed || d.event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-muted hover:bg-primary-soft text-text hover:text-primary border border-border transition cursor-pointer self-start sm:self-auto shrink-0 min-h-[40px]"
                    title="Add event reminder to Apple / Google / Outlook calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-primary" />
                    <span>Add to calendar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Action Checklist */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary shrink-0" />
              <h3 className="text-base font-bold text-text">Action Checklist</h3>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Concrete practical steps before signing, during the contract, and at exit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress pill */}
            <div className="flex items-center gap-2 text-xs bg-surface-muted px-3 py-1 rounded-full border border-border">
              <span className="font-semibold text-text">
                {completedCount}/{checklist.length} Done ({progressPercent}%)
              </span>
              <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-risk-low-fg transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyChecklist}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-muted text-text transition cursor-pointer min-h-[40px]"
              title="Copy checklist as text"
            >
              {copiedChecklist ? (
                <Check className="w-3.5 h-3.5 text-risk-low-fg" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedChecklist ? 'Copied' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Phase Groups */}
        <div className="space-y-5 pt-2">
          {/* Phase 1: Before Signing */}
          {beforeSigning.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span>Phase 1: Before Signing</span>
              </div>
              <div className="space-y-2">
                {beforeSigning.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition min-h-[44px] ${
                      completedMap[item.id]
                        ? 'bg-surface-muted/50 border-border opacity-70'
                        : 'bg-surface border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedMap[item.id]}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            completedMap[item.id] ? 'line-through text-text-muted' : 'text-text'
                          }`}
                        >
                          {item.task || item.item}
                        </span>
                        {getCriticalityBadge(item.criticality)}
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.details}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Phase 2: During Term */}
          {duringTerm.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span>Phase 2: During Term</span>
              </div>
              <div className="space-y-2">
                {duringTerm.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition min-h-[44px] ${
                      completedMap[item.id]
                        ? 'bg-surface-muted/50 border-border opacity-70'
                        : 'bg-surface border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedMap[item.id]}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            completedMap[item.id] ? 'line-through text-text-muted' : 'text-text'
                          }`}
                        >
                          {item.task || item.item}
                        </span>
                        {getCriticalityBadge(item.criticality)}
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.details}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Phase 3: At Termination */}
          {atTermination.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span>Phase 3: At Termination / Exit</span>
              </div>
              <div className="space-y-2">
                {atTermination.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition min-h-[44px] ${
                      completedMap[item.id]
                        ? 'bg-surface-muted/50 border-border opacity-70'
                        : 'bg-surface border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedMap[item.id]}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            completedMap[item.id] ? 'line-through text-text-muted' : 'text-text'
                          }`}
                        >
                          {item.task || item.item}
                        </span>
                        {getCriticalityBadge(item.criticality)}
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.details}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
