import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeApiRequestSchema } from '@/lib/schemas';
import { analyzeDocumentService } from '@/lib/services/analyzeService';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60;
export const runtime = 'nodejs'; // Explicit Node.js runtime for Vercel (PDF & crypto support)

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 25);
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait a moment before analyzing again.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      );
    }

    // Check payload size to protect against Vercel payload limits (Vercel has ~4.5MB limit)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 4 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'Document payload exceeds the maximum 4 MB size limit for analysis.',
          code: 'PAYLOAD_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Malformed JSON payload.',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    const parseResult = AnalyzeApiRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issueDetails = parseResult.error.issues
        .map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
        .join(', ');
      return NextResponse.json(
        {
          error: `Invalid request data: ${issueDetails}`,
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    const result = await analyzeDocumentService(parseResult.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errStack = err instanceof Error ? err.stack : undefined;
    const errCause = err instanceof Error ? err.cause : undefined;

    // Full server-side diagnostic logging for Vercel Function Logs
    console.error('[/api/analyze] Detailed Error:', {
      message: errMsg,
      stack: errStack,
      cause: errCause,
    });

    // Check for API key / Auth failures
    const lowerMsg = errMsg.toLowerCase();
    if (
      lowerMsg.includes('api_key') ||
      lowerMsg.includes('api key') ||
      lowerMsg.includes('unauthenticated') ||
      lowerMsg.includes('permission_denied')
    ) {
      return NextResponse.json(
        {
          error: 'Authentication failed. Please verify the Gemini API key configuration.',
          code: 'AUTH_FAILED',
        },
        { status: 401 }
      );
    }

    // Check for Rate Limit or Quota Exhausted upstream from Gemini
    if (
      lowerMsg.includes('resource_exhausted') ||
      lowerMsg.includes('429') ||
      lowerMsg.includes('quota')
    ) {
      return NextResponse.json(
        {
          error: 'The AI service quota is currently exhausted. Please try again in a few moments.',
          code: 'UPSTREAM_QUOTA_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Check for model service unavailable / 503
    if (lowerMsg.includes('unavailable') || lowerMsg.includes('503')) {
      return NextResponse.json(
        {
          error: 'The AI model is currently under high demand. Please retry shortly.',
          code: 'MODEL_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Generic error for truly unexpected errors with code ANALYZE_FAILED
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while analyzing the document.',
        code: 'ANALYZE_FAILED',
      },
      { status: 500 }
    );
  }
}
