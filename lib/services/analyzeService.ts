import crypto from 'crypto';
import { getGeminiModel, generateContentWithRetry } from '@/lib/gemini';
import { SYSTEM_BASE, buildAnalyzePrompt, buildRepairPrompt } from '@/lib/prompts';
import { AnalyzeApiRequest, AnalyzeResultSchema, AnalyzeResult, ClauseCard } from '@/lib/schemas';
import { verifyQuotes } from '@/lib/verify';

// In-memory LRU-like cache for document analysis results
const cache = new Map<string, { timestamp: number; result: AnalyzeResult }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const MAX_CACHE_SIZE = 100;

function computeCacheKey(params: AnalyzeApiRequest): string {
  const hash = crypto.createHash('sha256');
  hash.update(params.documentText);
  hash.update(params.documentType);
  hash.update(params.jurisdictionState);
  hash.update(params.language);
  hash.update(String(Boolean(params.isScanned)));
  return hash.digest('hex');
}

export async function analyzeDocumentService(params: AnalyzeApiRequest): Promise<AnalyzeResult> {
  const cacheKey = computeCacheKey(params);
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const model = getGeminiModel();
  const prompt = buildAnalyzePrompt({
    documentText: params.documentText,
    documentType: params.documentType,
    jurisdictionState: params.jurisdictionState,
    language: params.language,
    isScanned: params.isScanned,
  });

  const response = await generateContentWithRetry({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_BASE,
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const rawResponseText = response.text || '';
  let validatedData: AnalyzeResult | null = null;
  let jsonParseError = '';

  try {
    const cleanJson = rawResponseText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '');
    const parsedJson = JSON.parse(cleanJson);
    const zodValidation = AnalyzeResultSchema.safeParse(parsedJson);

    if (zodValidation.success) {
      validatedData = zodValidation.data;
    } else {
      jsonParseError = zodValidation.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
    }
  } catch (e: unknown) {
    jsonParseError = e instanceof Error ? e.message : 'Invalid JSON syntax';
  }

  // Single repair retry if initial format failed
  if (!validatedData) {
    try {
      const repairPrompt = buildRepairPrompt(rawResponseText, jsonParseError);
      const repairResponse = await generateContentWithRetry({
        model,
        contents: repairPrompt,
        config: {
          systemInstruction: SYSTEM_BASE,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const repairedClean = (repairResponse.text || '')
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const repairedParsed = JSON.parse(repairedClean);
      const secondValidation = AnalyzeResultSchema.safeParse(repairedParsed);

      if (secondValidation.success) {
        validatedData = secondValidation.data;
      }
    } catch (retryError) {
      console.warn('Repair retry failed for document analysis:', retryError);
    }
  }

  if (!validatedData) {
    throw new Error('Could not parse valid structured analysis from AI output.');
  }

  // Hallucination Guard: Verify verbatim quotes against original document text
  const { verifiedItems: verifiedClauses, report } = verifyQuotes<ClauseCard>(
    validatedData.clauses,
    params.documentText
  );

  const keyDates = validatedData.keyDatesAndDeadlines || validatedData.keyDates || [];
  const actionChecklist = validatedData.actionChecklist || [];

  const highRisks = verifiedClauses.filter((c: ClauseCard) => c.risk === 'high');
  const lawyerBrief = validatedData.lawyerBrief || {
    executiveSummary: `${params.documentType} governed by ${params.jurisdictionState} jurisdiction. Flagged ${highRisks.length} elevated risks.`,
    prioritizedQuestions: validatedData.questionsToAsk?.map((q) => q.question) || [],
    negotiationPoints: highRisks.map((c: ClauseCard) => c.title).slice(0, 5),
  };

  const finalResult: AnalyzeResult = {
    ...validatedData,
    clauses: verifiedClauses,
    keyDates,
    keyDatesAndDeadlines: keyDates,
    actionChecklist,
    lawyerBrief,
    verificationReport: report,
  };

  // Cache management
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, { timestamp: now, result: finalResult });

  return finalResult;
}
