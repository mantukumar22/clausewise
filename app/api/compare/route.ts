import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGeminiModel, generateContentWithRetry } from '@/lib/gemini';
import { SYSTEM_BASE, buildComparePrompt, buildRepairPrompt } from '@/lib/prompts';
import { CompareApiRequestSchema, CompareResultSchema, CompareResult } from '@/lib/schemas';
import { fuzzyFindQuote } from '@/lib/verify';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 20);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before running another comparison.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = CompareApiRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error:
            'Invalid comparison request: ' +
            parseResult.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const {
      documentTextA,
      documentTextB,
      docAName,
      docBName,
      documentType,
      jurisdictionState,
      language,
    } = parseResult.data;

    const ai = getGeminiClient();
    const model = getGeminiModel();

    const prompt = buildComparePrompt({
      documentTextA,
      documentTextB,
      docAName,
      docBName,
      documentType,
      jurisdictionState,
      language,
    });

    let rawResponseText = '';

    try {
      const response = await generateContentWithRetry({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_BASE,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });
      rawResponseText = response.text || '';
    } catch (apiError: unknown) {
      const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
      console.error('Gemini API call failed during compare:', errMsg);
      return NextResponse.json(
        { error: 'An error occurred during comparison analysis. Please try again shortly.' },
        { status: 502 }
      );
    }

    let validatedData: CompareResult | null = null;
    let jsonParseError = '';

    try {
      const cleanJson = rawResponseText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const parsedJson = JSON.parse(cleanJson);
      const zodValidation = CompareResultSchema.safeParse(parsedJson);

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

    // Repair retry
    if (!validatedData) {
      console.warn('Compare JSON validation failed, attempting repair:', jsonParseError);
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
        const secondValidation = CompareResultSchema.safeParse(repairedParsed);

        if (secondValidation.success) {
          validatedData = secondValidation.data;
        }
      } catch (retryError) {
        console.error('Compare repair retry error:', retryError);
      }
    }

    if (!validatedData) {
      return NextResponse.json(
        { error: 'Unable to parse document comparison diff. Please check the document contents.' },
        { status: 422 }
      );
    }

    // Server-side citation verification for added, removed, changed clauses
    const verifiedAdded = validatedData.addedClauses.map((item) => ({
      ...item,
      isVerified: fuzzyFindQuote(item.quoteDocB, documentTextB).isVerified,
    }));

    const verifiedRemoved = validatedData.removedClauses.map((item) => ({
      ...item,
      isVerified: fuzzyFindQuote(item.quoteDocA, documentTextA).isVerified,
    }));

    const verifiedChanged = validatedData.changedClauses.map((item) => ({
      ...item,
      isVerifiedA: fuzzyFindQuote(item.quoteDocA, documentTextA).isVerified,
      isVerifiedB: fuzzyFindQuote(item.quoteDocB, documentTextB).isVerified,
    }));

    return NextResponse.json({
      ...validatedData,
      addedClauses: verifiedAdded,
      removedClauses: verifiedRemoved,
      changedClauses: verifiedChanged,
    });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/compare:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while comparing the documents.' },
      { status: 500 }
    );
  }
}
