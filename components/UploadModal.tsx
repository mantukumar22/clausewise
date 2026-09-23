'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Loader2,
  Camera,
  ShieldCheck,
  FileType,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentReady: (doc: {
    text: string;
    pages: string[];
    totalPages: number;
    isScanned: boolean;
    fileName: string;
  }) => void;
  initialMode?: 'file' | 'camera' | 'paste';
}

export function UploadModal({
  isOpen,
  onClose,
  onDocumentReady,
  initialMode = 'file',
}: UploadModalProps) {
  const [tab, setTab] = useState<'file' | 'paste'>(initialMode === 'paste' ? 'paste' : 'file');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('Pasted Agreement');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage(null);
    const maxBytes = 20 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setErrorMessage('File size exceeds 20 MB limit. Please select a smaller file.');
      return;
    }

    const name = selectedFile.name.toLowerCase();
    const type = selectedFile.type;
    const isValid =
      type === 'application/pdf' ||
      type.startsWith('image/') ||
      type.includes('text') ||
      name.endsWith('.pdf') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.docx') ||
      name.endsWith('.txt');

    if (!isValid) {
      setErrorMessage(
        'Unsupported file type. Please upload a PDF, image, Word (.docx), or text file.'
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (tab === 'file') {
        if (!file) {
          setErrorMessage('Please select a file or take a photo.');
          setIsProcessing(false);
          return;
        }

        setProgressStep('Uploading document securely...');
        let fileToUpload = file;

        // If file is a large image (> 1.5MB), compress client-side via canvas
        if (file.type.startsWith('image/') && file.size > 1.5 * 1024 * 1024) {
          try {
            setProgressStep('Compressing high-resolution photo...');
            const compressedBlob = await new Promise<Blob | null>((resolve) => {
              const img = new Image();
              const objectUrl = URL.createObjectURL(file);
              img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const maxDim = 2000;
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                  if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                  } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                  }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82);
                } else {
                  resolve(null);
                }
              };
              img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(null);
              };
              img.src = objectUrl;
            });

            if (compressedBlob) {
              fileToUpload = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
              });
            }
          } catch (compressErr) {
            console.warn('Client-side compression fallback to original file:', compressErr);
          }
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        setProgressStep('Extracting pages & text...');
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to process document file');
        }

        setProgressStep('Document ready!');
        onDocumentReady(data);
        onClose();
      } else {
        if (pastedText.trim().length < 50) {
          setErrorMessage('Please paste at least 50 characters of contract text.');
          setIsProcessing(false);
          return;
        }

        setProgressStep('Formatting text document...');
        const pages = [pastedText.trim()];
        onDocumentReady({
          text: pastedText.trim(),
          pages,
          totalPages: 1,
          isScanned: false,
          fileName: documentTitle.trim() || 'Pasted Agreement',
        });
        onClose();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while uploading.';
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="upload-document-modal"
        className="bg-surface rounded-2xl border border-border shadow-xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">Add Agreement</h3>
              <p className="text-xs text-text-muted">Processed in memory. Never saved or shared.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-muted transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: File/Camera vs Paste */}
        <div className="flex items-center p-1 bg-surface-muted rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer min-h-[40px] ${
              tab === 'file'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            PDF / Photo / Word
          </button>
          <button
            type="button"
            onClick={() => setTab('paste')}
            className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer min-h-[40px] ${
              tab === 'paste'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Paste Text
          </button>
        </div>

        {tab === 'file' ? (
          <div className="space-y-3">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition ${
                dragActive
                  ? 'border-primary bg-primary-soft/30'
                  : 'border-border bg-surface-muted/40 hover:bg-surface-muted/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-surface flex items-center justify-center text-primary shadow-xs border border-border">
                <FileType className="w-6 h-6" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Tap to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text">Drag & drop or tap to choose file</p>
                  <p className="text-[11px] text-text-muted">
                    PDF, photo, Word (.docx), or plain text (up to 20 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Mobile camera direct trigger */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline cursor-pointer py-1"
              >
                <Camera className="w-4 h-4" />
                <span>Or take a photo with camera</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Agreement Title</label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g. Pune Flat Agreement"
                className="w-full text-xs px-3.5 py-2 bg-surface-muted border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-focus-ring min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Agreement Text</label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full text of your agreement here..."
                className="w-full text-xs font-mono p-3 bg-surface-muted border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-focus-ring"
              />
            </div>
          </div>
        )}

        {/* Privacy reassurance badge */}
        <div className="p-3 rounded-xl bg-surface-muted/70 border border-border flex items-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-risk-low-fg shrink-0" />
          <span>
            Your file stays private. It is processed in memory and never stored on a server.
          </span>
        </div>

        {/* Status / Progress message */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-soft text-xs text-primary font-medium">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{progressStep}</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-risk-high-bg text-xs text-risk-high-fg border border-risk-high-border">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text rounded-xl transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isProcessing || (tab === 'file' && !file) || (tab === 'paste' && !pastedText.trim())
            }
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-xs disabled:opacity-40 hover:opacity-95 active:scale-95 transition cursor-pointer min-h-[44px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Start Analysis</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
