import { extractText } from 'unpdf';
import { getGeminiClient, getGeminiModel } from './gemini';

export interface ExtractedDocument {
  text: string;
  pages: string[];
  totalPages: number;
  isScanned: boolean;
  ocrApplied?: boolean;
}

export async function extractPdfTextWithPages(
  pdfBuffer: ArrayBuffer | Uint8Array
): Promise<ExtractedDocument> {
  try {
    const data = await extractText(pdfBuffer, { mergePages: false });
    const pages: string[] = Array.isArray(data.text) ? data.text : [data.text];
    const totalPages = data.totalPages || pages.length;

    // Check if pages have very little text (potential scanned PDF)
    const combinedLength = pages.reduce((acc, p) => acc + p.trim().length, 0);
    const isPotentiallyScanned = combinedLength < 80 && totalPages > 0;

    // Format combined text with clear page markers so Gemini can cite exact pages
    const combinedText = pages
      .map((pageText, idx) => `[Page ${idx + 1}]\n${pageText.trim()}`)
      .join('\n\n');

    return {
      text: combinedText,
      pages,
      totalPages,
      isScanned: isPotentiallyScanned,
    };
  } catch (error) {
    console.error('Error extracting PDF text with unpdf:', error);
    throw new Error('Failed to extract text from PDF document');
  }
}

// Scanned document / image transcription using Gemini
export async function transcribeScannedDocument(
  base64Data: string,
  mimeType: string = 'image/png'
): Promise<ExtractedDocument> {
  const ai = getGeminiClient();
  const model = getGeminiModel();

  const prompt = `
You are an OCR and document transcription engine specializing in Indian legal documents (rental agreements, stamp paper, employment letters, loan agreements).
Transcribe the entire text from this document verbatim.
CRITICAL RULES:
1. Preserve all page markers clearly as [Page 1], [Page 2], etc. if multiple pages or sheets are visible.
2. Transcribe names, addresses, amounts (₹, Rupees), numbers, and clauses accurately.
3. Transcribe both English and Hindi/regional language text if present.
4. Return ONLY the transcribed text with page markers. Do not add conversational remarks or analysis.
`.trim();

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      temperature: 0.1,
    },
  });

  const rawText = response.text || '';
  // Split into pages if [Page X] markers exist
  const pageRegex = /\[Page\s*(\d+)\]/i;
  const rawParts = rawText.split(pageRegex);

  const pages: string[] = [];
  if (rawParts.length > 1) {
    for (let i = 1; i < rawParts.length; i += 2) {
      pages.push(rawParts[i + 1]?.trim() || '');
    }
  } else {
    pages.push(rawText.trim());
  }

  return {
    text: rawText,
    pages: pages.length > 0 ? pages : [rawText],
    totalPages: pages.length > 0 ? pages.length : 1,
    isScanned: true,
    ocrApplied: true,
  };
}
