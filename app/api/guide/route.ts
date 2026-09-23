import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGeminiModel, generateContentWithRetry } from '@/lib/gemini';
import { SYSTEM_BASE, buildGuideMePrompt, buildRepairPrompt } from '@/lib/prompts';
import { GuideMeApiRequestSchema, GuideMeResultSchema, GuideMeResult } from '@/lib/schemas';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 30);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = GuideMeApiRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request: ' + parseResult.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { situationType, userDescription, followUpAnswers, jurisdictionState, language } =
      parseResult.data;

    // Check for safety / emergency keywords directly as a fast deterministic safety guard
    const urgentKeywords = [
      'kill',
      'suicide',
      'die',
      'murder',
      'physically hurt',
      'hit me',
      'beat me',
      'assault',
      'violence',
      'lock me out today',
      'forced out on the street',
      'threatened with weapon',
      'extortion',
      'goons',
      'bouncers sent',
    ];
    const descLower = userDescription.toLowerCase();
    const hasEmergencyKeywords = urgentKeywords.some((kw) => descLower.includes(kw));

    const ai = getGeminiClient();
    const model = getGeminiModel();

    const prompt = buildGuideMePrompt({
      situationType,
      userDescription,
      followUpAnswers,
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
      console.error('Gemini API call failed during guide:', errMsg);
      return NextResponse.json(
        {
          error:
            'An error occurred while communicating with the AI service. Please try again shortly.',
        },
        { status: 502 }
      );
    }

    let validatedData: GuideMeResult | null = null;
    let jsonParseError = '';

    try {
      const cleanJson = rawResponseText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const parsedJson = JSON.parse(cleanJson);
      const zodValidation = GuideMeResultSchema.safeParse(parsedJson);

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

    // Single repair attempt
    if (!validatedData) {
      console.warn('Initial Guide JSON validation failed, retrying repair:', jsonParseError);
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
        const secondValidation = GuideMeResultSchema.safeParse(repairedParsed);

        if (secondValidation.success) {
          validatedData = secondValidation.data;
        }
      } catch (retryErr) {
        console.error('Repair retry failed for guide:', retryErr);
      }
    }

    if (!validatedData) {
      return NextResponse.json(
        {
          error:
            'Could not generate structured guidance for this situation. Please describe your situation in more detail.',
        },
        { status: 422 }
      );
    }

    // Force emergency safety alert if emergency keywords matched even if model missed it
    if (hasEmergencyKeywords && !validatedData.isUrgentOrSafetyRisk) {
      validatedData.isUrgentOrSafetyRisk = true;
      validatedData.safetyAlert = {
        isEmergency: true,
        warningMessage:
          'Your situation may involve physical safety, urgent eviction, or severe intimidation. Please prioritize your physical safety and contact official helplines immediately before taking other steps.',
        contacts: [
          {
            name: 'National Emergency Helpline',
            numberOrUrl: '112',
            details: 'Immediate police / emergency assistance available 24/7 across India',
          },
          {
            name: 'NALSA Legal Aid Helpline',
            numberOrUrl: '15100',
            details:
              'Free legal aid and protection assistance through District Legal Services Authority',
          },
          {
            name: 'Women Helpline',
            numberOrUrl: '1091',
            details:
              '24/7 emergency response for women facing harassment, threats, or domestic distress',
          },
        ],
      };
    }

    return NextResponse.json(validatedData);
  } catch (err: unknown) {
    console.error('Unexpected error in /api/guide:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
