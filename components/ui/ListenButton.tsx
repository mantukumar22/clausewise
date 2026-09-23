'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface ListenButtonProps {
  textToRead: string;
  label?: string;
  className?: string;
  lang?: string;
}

export function ListenButton({
  textToRead,
  label = 'Listen',
  className = '',
  lang = 'en-IN',
}: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });

  const handleTogglePlay = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower, highly intelligible for non-lawyers

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      aria-label={isPlaying ? 'Stop reading aloud' : `Read aloud: ${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer min-h-[32px] ${
        isPlaying
          ? 'bg-primary text-primary-foreground border-primary animate-pulse'
          : 'bg-surface-muted text-text-muted hover:text-text border-border hover:bg-border'
      } ${className}`}
      title={isPlaying ? 'Stop listening' : 'Listen to this explanation'}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-primary" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
