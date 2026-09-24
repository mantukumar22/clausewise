import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGeminiModel } from '@/lib/gemini';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const hasKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
    if (!hasKey) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'KEY_MISSING',
          message: 'GEMINI_API_KEY is not configured in environment variables.',
        },
        { status: 503 }
      );
    }

    // Verify SDK can be instantiated
    const client = getGeminiClient();
    const model = getGeminiModel();

    return NextResponse.json({
      status: 'healthy',
      model,
      clientConfigured: Boolean(client),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Health check failed:', errMsg);
    return NextResponse.json(
      {
        status: 'error',
        code: 'HEALTH_CHECK_FAILED',
        error: errMsg,
      },
      { status: 500 }
    );
  }
}
