import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeApiRequestSchema } from '@/lib/schemas';
import { analyzeDocumentService } from '@/lib/services/analyzeService';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 25);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before analyzing again.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = AnalyzeApiRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error:
            'Invalid request data: ' + parseResult.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const result = await analyzeDocumentService(parseResult.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/analyze:', errMsg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while analyzing the document.' },
      { status: 500 }
    );
  }
}
