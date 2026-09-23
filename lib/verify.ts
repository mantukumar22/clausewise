export interface VerificationResult {
  isVerified: boolean;
  matchConfidence: number; // 0 to 100
  matchedSnippet?: string;
  isApproximate?: boolean;
}

export interface CitationReport {
  totalCitations: number;
  verifiedCount: number;
  unverifiedCount: number;
  isScanned: boolean;
}

// Normalize text for robust comparison
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // en-dash, em-dash
    .replace(/[^\w\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

// Calculate token overlap (Jaccard-like or substring token containment)
export function calculateTokenOverlap(quote: string, documentText: string): number {
  const quoteTokens = normalizeText(quote)
    .split(' ')
    .filter((t) => t.length > 2);
  if (quoteTokens.length === 0) return 100;

  const docNorm = normalizeText(documentText);
  const docTokens = new Set(docNorm.split(' '));

  let matches = 0;
  for (const token of quoteTokens) {
    if (docTokens.has(token)) {
      matches++;
    }
  }

  return Math.round((matches / quoteTokens.length) * 100);
}

// Sliding window fuzzy matcher for OCR/scanned text
export function fuzzyFindQuote(
  quote: string,
  documentText: string,
  isScanned: boolean = false
): VerificationResult {
  if (!quote || quote.trim().length === 0) {
    return { isVerified: false, matchConfidence: 0 };
  }

  const normQuote = normalizeText(quote);
  const normDoc = normalizeText(documentText);

  // 1. Strict substring match (after basic normalization)
  if (normDoc.includes(normQuote)) {
    return {
      isVerified: true,
      matchConfidence: 100,
      matchedSnippet: quote,
      isApproximate: false,
    };
  }

  // 2. Multi-word sub-phrase match: check if the first 60% and last 40% match
  const words = normQuote.split(' ');
  if (words.length >= 6) {
    const head = words.slice(0, Math.min(8, words.length)).join(' ');
    const tail = words.slice(Math.max(0, words.length - 6)).join(' ');
    if (normDoc.includes(head) || normDoc.includes(tail)) {
      return {
        isVerified: true,
        matchConfidence: 85,
        matchedSnippet: quote,
        isApproximate: true,
      };
    }
  }

  // 3. For scanned documents or OCR, check token overlap with a configurable threshold
  const tokenOverlapScore = calculateTokenOverlap(quote, documentText);
  const threshold = isScanned ? 65 : 80;

  if (tokenOverlapScore >= threshold) {
    return {
      isVerified: true,
      matchConfidence: tokenOverlapScore,
      matchedSnippet: quote,
      isApproximate: true,
    };
  }

  return {
    isVerified: false,
    matchConfidence: tokenOverlapScore,
  };
}

// Verification for an array of items with a verbatimQuote property
export function verifyQuotes<
  T extends { verbatimQuote: string; isVerified?: boolean; matchConfidence?: number },
>(
  items: T[],
  documentText: string,
  isScanned: boolean = false
): { verifiedItems: T[]; report: CitationReport } {
  let verifiedCount = 0;
  let unverifiedCount = 0;

  const verifiedItems = items.map((item) => {
    const result = fuzzyFindQuote(item.verbatimQuote, documentText, isScanned);
    if (result.isVerified) {
      verifiedCount++;
    } else {
      unverifiedCount++;
    }

    return {
      ...item,
      isVerified: result.isVerified,
      matchConfidence: result.matchConfidence,
    };
  });

  return {
    verifiedItems,
    report: {
      totalCitations: items.length,
      verifiedCount,
      unverifiedCount,
      isScanned,
    },
  };
}
