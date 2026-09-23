import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGeminiModel, generateContentWithRetry } from '@/lib/gemini';
import { SYSTEM_BASE, buildChatPrompt, buildRepairPrompt } from '@/lib/prompts';
import { ChatApiRequestSchema, ChatResultSchema, ChatResult } from '@/lib/schemas';
import { fuzzyFindQuote } from '@/lib/verify';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 40);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            'Too many chat messages. Please wait a few seconds before asking another question.',
        },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = ChatApiRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error:
            'Invalid chat request: ' + parseResult.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { documentText, messages, documentType, jurisdictionState, language } = parseResult.data;

    const latestMessage = messages[messages.length - 1]?.content || '';
    const history = messages.slice(0, messages.length - 1);

    const ai = getGeminiClient();
    const model = getGeminiModel();

    const prompt = buildChatPrompt({
      documentText,
      documentType,
      jurisdictionState,
      language,
      history,
      latestQuery: latestMessage,
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
      console.error('Gemini API call failed during chat:', errMsg);
      return NextResponse.json(
        { error: 'Failed to query the document with AI. Please try again.' },
        { status: 502 }
      );
    }

    let validatedData: ChatResult | null = null;
    let jsonParseError = '';

    try {
      const cleanJson = rawResponseText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const parsedJson = JSON.parse(cleanJson);
      const zodValidation = ChatResultSchema.safeParse(parsedJson);

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

    // Repair attempt if needed
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
        const secondValidation = ChatResultSchema.safeParse(repairedParsed);
        if (secondValidation.success) {
          validatedData = secondValidation.data;
        }
      } catch (retryErr) {
        console.error('Chat repair error:', retryErr);
      }
    }

    // Fallback if structured output fails completely
    if (!validatedData) {
      return NextResponse.json({
        answer:
          rawResponseText.replace(/[{}"[\]]/g, '').trim() ||
          'I apologize, but I could not formulate a verified answer from the document.',
        citations: [],
        isFoundInDocument: true,
        relatedTopics: [],
      });
    }

    // Hallucination Guard for citations
    const verifiedCitations = (validatedData.citations || []).map((cit) => {
      const check = fuzzyFindQuote(cit.quote, documentText);
      return {
        ...cit,
        isVerified: check.isVerified,
      };
    });

    return NextResponse.json({
      ...validatedData,
      citations: verifiedCitations,
    });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/chat:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your question.' },
      { status: 500 }
    );
  }
}
