import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGeminiModel, generateContentWithRetry } from '@/lib/gemini';
import { SYSTEM_BASE, buildDraftLetterPrompt, buildRepairPrompt } from '@/lib/prompts';
import {
  DraftLetterRequestSchema,
  DraftLetterResponseSchema,
  DraftLetterResponse,
} from '@/lib/schemas';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 30);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before drafting again.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = DraftLetterRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error:
            'Invalid letter draft data: ' +
            parseResult.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const model = getGeminiModel();

    const prompt = buildDraftLetterPrompt(parseResult.data);

    let rawResponseText = '';

    try {
      const response = await generateContentWithRetry({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_BASE,
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });
      rawResponseText = response.text || '';
    } catch (apiError: unknown) {
      const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
      console.error('Gemini API call failed during draft-letter:', errMsg);
      return NextResponse.json(
        {
          error: 'An error occurred while generating your draft letter. Please try again shortly.',
        },
        { status: 502 }
      );
    }

    let validatedData: DraftLetterResponse | null = null;
    let jsonParseError = '';

    try {
      const cleanJson = rawResponseText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const parsedJson = JSON.parse(cleanJson);
      const zodValidation = DraftLetterResponseSchema.safeParse(parsedJson);

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
        const secondValidation = DraftLetterResponseSchema.safeParse(repairedParsed);

        if (secondValidation.success) {
          validatedData = secondValidation.data;
        }
      } catch (retryErr) {
        console.error('Repair retry failed for draft letter:', retryErr);
      }
    }

    if (!validatedData) {
      return NextResponse.json(
        { error: 'Could not format draft letter. Please try again.' },
        { status: 422 }
      );
    }

    // Always enforce the mandatory disclaimer banner
    validatedData.disclaimerBanner =
      "Draft for your reference. Have it reviewed before sending anything formal. This is communication assistance, not formal legal representation or an advocate's notice.";

    return NextResponse.json(validatedData);
  } catch (err: unknown) {
    console.error('Unexpected error in /api/draft-letter:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while drafting the letter.' },
      { status: 500 }
    );
  }
}
